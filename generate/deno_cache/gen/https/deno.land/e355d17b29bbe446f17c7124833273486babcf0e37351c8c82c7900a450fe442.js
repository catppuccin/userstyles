// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { assert } from "../_util/asserts.ts";
import { copy } from "../bytes/copy.ts";
// MIN_READ is the minimum ArrayBuffer size passed to a read call by
// buffer.ReadFrom. As long as the Buffer has at least MIN_READ bytes beyond
// what is required to hold the contents of r, readFrom() will not grow the
// underlying buffer.
const MIN_READ = 32 * 1024;
const MAX_SIZE = 2 ** 32 - 2;
/** A variable-sized buffer of bytes with `read()` and `write()` methods.
 *
 * Buffer is almost always used with some I/O like files and sockets. It allows
 * one to buffer up a download from a socket. Buffer grows and shrinks as
 * necessary.
 *
 * Buffer is NOT the same thing as Node's Buffer. Node's Buffer was created in
 * 2009 before JavaScript had the concept of ArrayBuffers. It's simply a
 * non-standard ArrayBuffer.
 *
 * ArrayBuffer is a fixed memory allocation. Buffer is implemented on top of
 * ArrayBuffer.
 *
 * Based on [Go Buffer](https://golang.org/pkg/bytes/#Buffer). */ export class Buffer {
    #buf;
    #off = 0;
    constructor(ab){
        this.#buf = ab === undefined ? new Uint8Array(0) : new Uint8Array(ab);
    }
    /** Returns a slice holding the unread portion of the buffer.
   *
   * The slice is valid for use only until the next buffer modification (that
   * is, only until the next call to a method like `read()`, `write()`,
   * `reset()`, or `truncate()`). If `options.copy` is false the slice aliases the buffer content at
   * least until the next buffer modification, so immediate changes to the
   * slice will affect the result of future reads.
   * @param [options={ copy: true }]
   */ bytes(options = {
        copy: true
    }) {
        if (options.copy === false) return this.#buf.subarray(this.#off);
        return this.#buf.slice(this.#off);
    }
    /** Returns whether the unread portion of the buffer is empty. */ empty() {
        return this.#buf.byteLength <= this.#off;
    }
    /** A read only number of bytes of the unread portion of the buffer. */ get length() {
        return this.#buf.byteLength - this.#off;
    }
    /** The read only capacity of the buffer's underlying byte slice, that is,
   * the total space allocated for the buffer's data. */ get capacity() {
        return this.#buf.buffer.byteLength;
    }
    /** Discards all but the first `n` unread bytes from the buffer but
   * continues to use the same allocated storage. It throws if `n` is
   * negative or greater than the length of the buffer. */ truncate(n) {
        if (n === 0) {
            this.reset();
            return;
        }
        if (n < 0 || n > this.length) {
            throw Error("bytes.Buffer: truncation out of range");
        }
        this.#reslice(this.#off + n);
    }
    reset() {
        this.#reslice(0);
        this.#off = 0;
    }
    #tryGrowByReslice(n) {
        const l = this.#buf.byteLength;
        if (n <= this.capacity - l) {
            this.#reslice(l + n);
            return l;
        }
        return -1;
    }
    #reslice(len) {
        assert(len <= this.#buf.buffer.byteLength);
        this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
    }
    /** Reads the next `p.length` bytes from the buffer or until the buffer is
   * drained. Returns the number of bytes read. If the buffer has no data to
   * return, the return is EOF (`null`). */ readSync(p) {
        if (this.empty()) {
            // Buffer is empty, reset to recover space.
            this.reset();
            if (p.byteLength === 0) {
                // this edge case is tested in 'bufferReadEmptyAtEOF' test
                return 0;
            }
            return null;
        }
        const nread = copy(this.#buf.subarray(this.#off), p);
        this.#off += nread;
        return nread;
    }
    /** Reads the next `p.length` bytes from the buffer or until the buffer is
   * drained. Resolves to the number of bytes read. If the buffer has no
   * data to return, resolves to EOF (`null`).
   *
   * NOTE: This methods reads bytes synchronously; it's provided for
   * compatibility with `Reader` interfaces.
   */ read(p) {
        const rr = this.readSync(p);
        return Promise.resolve(rr);
    }
    writeSync(p) {
        const m = this.#grow(p.byteLength);
        return copy(p, this.#buf, m);
    }
    /** NOTE: This methods writes bytes synchronously; it's provided for
   * compatibility with `Writer` interface. */ write(p) {
        const n = this.writeSync(p);
        return Promise.resolve(n);
    }
    #grow(n1) {
        const m = this.length;
        // If buffer is empty, reset to recover space.
        if (m === 0 && this.#off !== 0) {
            this.reset();
        }
        // Fast: Try to grow by means of a reslice.
        const i = this.#tryGrowByReslice(n1);
        if (i >= 0) {
            return i;
        }
        const c = this.capacity;
        if (n1 <= Math.floor(c / 2) - m) {
            // We can slide things down instead of allocating a new
            // ArrayBuffer. We only need m+n <= c to slide, but
            // we instead let capacity get twice as large so we
            // don't spend all our time copying.
            copy(this.#buf.subarray(this.#off), this.#buf);
        } else if (c + n1 > MAX_SIZE) {
            throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
            // Not enough space anywhere, we need to allocate.
            const buf = new Uint8Array(Math.min(2 * c + n1, MAX_SIZE));
            copy(this.#buf.subarray(this.#off), buf);
            this.#buf = buf;
        }
        // Restore this.#off and len(this.#buf).
        this.#off = 0;
        this.#reslice(Math.min(m + n1, MAX_SIZE));
        return m;
    }
    /** Grows the buffer's capacity, if necessary, to guarantee space for
   * another `n` bytes. After `.grow(n)`, at least `n` bytes can be written to
   * the buffer without another allocation. If `n` is negative, `.grow()` will
   * throw. If the buffer can't grow it will throw an error.
   *
   * Based on Go Lang's
   * [Buffer.Grow](https://golang.org/pkg/bytes/#Buffer.Grow). */ grow(n) {
        if (n < 0) {
            throw Error("Buffer.grow: negative count");
        }
        const m = this.#grow(n);
        this.#reslice(m);
    }
    /** Reads data from `r` until EOF (`null`) and appends it to the buffer,
   * growing the buffer as needed. It resolves to the number of bytes read.
   * If the buffer becomes too large, `.readFrom()` will reject with an error.
   *
   * Based on Go Lang's
   * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom). */ async readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            // read into tmp buffer if there's not enough room
            // otherwise read directly into the internal buffer
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = await r.read(buf);
            if (nread === null) {
                return n;
            }
            // write will grow if needed
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
    /** Reads data from `r` until EOF (`null`) and appends it to the buffer,
   * growing the buffer as needed. It returns the number of bytes read. If the
   * buffer becomes too large, `.readFromSync()` will throw an error.
   *
   * Based on Go Lang's
   * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom). */ readFromSync(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            // read into tmp buffer if there's not enough room
            // otherwise read directly into the internal buffer
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = r.readSync(buf);
            if (nread === null) {
                return n;
            }
            // write will grow if needed
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
}
export { /** @deprecated (will be removed after 0.172.0) Import from `std/io/buf_reader.ts` instead */ BufferFullError, /**
   * @deprecated (will be removed after 0.172.0) Import from `std/io/buf_reader.ts` instead
   *
   * BufReader implements buffering for a Reader object.
   */ BufReader, /** @deprecated (will be removed after 0.172.0) Import from `std/io/buf_reader.ts` instead */ PartialReadError } from "./buf_reader.ts";
export { /**
   * @deprecated (will be removed after 0.172.0) Import from `std/io/buf_writer.ts` instead
   *
   * BufWriter implements buffering for an deno.Writer object.
   * If an error occurs writing to a Writer, no more data will be
   * accepted and all subsequent writes, and flush(), will return the error.
   * After all data has been written, the client should call the
   * flush() method to guarantee all data has been forwarded to
   * the underlying deno.Writer.
   */ BufWriter, /**
   * @deprecated (will be removed after 0.172.0) Import from `std/io/buf_writer.ts` instead
   *
   * BufWriterSync implements buffering for a deno.WriterSync object.
   * If an error occurs writing to a WriterSync, no more data will be
   * accepted and all subsequent writes, and flush(), will return the error.
   * After all data has been written, the client should call the
   * flush() method to guarantee all data has been forwarded to
   * the underlying deno.WriterSync.
   */ BufWriterSync } from "./buf_writer.ts";
export { /**
   * @deprecated (will be removed after 0.172.0) Import from `std/io/read_delim.ts` instead
   *
   * Read delimited bytes from a Reader. */ readDelim } from "./read_delim.ts";
export { /**
   * @deprecated (will be removed after 0.172.0) Import from `std/io/read_string_delim.ts` instead
   *
   * Read Reader chunk by chunk, splitting based on delimiter.
   *
   * @example
   * ```ts
   * import { readStringDelim } from "https://deno.land/std@$STD_VERSION/io/mod.ts";
   * import * as path from "https://deno.land/std@$STD_VERSION/path/mod.ts";
   *
   * const filename = path.join(Deno.cwd(), "std/io/README.md");
   * let fileReader = await Deno.open(filename);
   *
   * for await (let line of readStringDelim(fileReader, "\n")) {
   *   console.log(line);
   * }
   * ```
   */ readStringDelim } from "./read_string_delim.ts";
export { /**
   * @deprecated (will be removed after 0.172.0) Import from `std/io/read_lines.ts` instead
   *
   * Read strings line-by-line from a Reader.
   *
   *  @example
   * ```ts
   * import { readLines } from "https://deno.land/std@$STD_VERSION/io/mod.ts";
   * import * as path from "https://deno.land/std@$STD_VERSION/path/mod.ts";
   *
   * const filename = path.join(Deno.cwd(), "std/io/README.md");
   * let fileReader = await Deno.open(filename);
   *
   * for await (let line of readLines(fileReader)) {
   *   console.log(line);
   * }
   * ```
   */ readLines } from "./read_lines.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2lvL2J1ZmZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4uL191dGlsL2Fzc2VydHMudHNcIjtcbmltcG9ydCB7IGNvcHkgfSBmcm9tIFwiLi4vYnl0ZXMvY29weS50c1wiO1xuaW1wb3J0IHR5cGUgeyBSZWFkZXIsIFJlYWRlclN5bmMgfSBmcm9tIFwiLi4vdHlwZXMuZC50c1wiO1xuXG4vLyBNSU5fUkVBRCBpcyB0aGUgbWluaW11bSBBcnJheUJ1ZmZlciBzaXplIHBhc3NlZCB0byBhIHJlYWQgY2FsbCBieVxuLy8gYnVmZmVyLlJlYWRGcm9tLiBBcyBsb25nIGFzIHRoZSBCdWZmZXIgaGFzIGF0IGxlYXN0IE1JTl9SRUFEIGJ5dGVzIGJleW9uZFxuLy8gd2hhdCBpcyByZXF1aXJlZCB0byBob2xkIHRoZSBjb250ZW50cyBvZiByLCByZWFkRnJvbSgpIHdpbGwgbm90IGdyb3cgdGhlXG4vLyB1bmRlcmx5aW5nIGJ1ZmZlci5cbmNvbnN0IE1JTl9SRUFEID0gMzIgKiAxMDI0O1xuY29uc3QgTUFYX1NJWkUgPSAyICoqIDMyIC0gMjtcblxuLyoqIEEgdmFyaWFibGUtc2l6ZWQgYnVmZmVyIG9mIGJ5dGVzIHdpdGggYHJlYWQoKWAgYW5kIGB3cml0ZSgpYCBtZXRob2RzLlxuICpcbiAqIEJ1ZmZlciBpcyBhbG1vc3QgYWx3YXlzIHVzZWQgd2l0aCBzb21lIEkvTyBsaWtlIGZpbGVzIGFuZCBzb2NrZXRzLiBJdCBhbGxvd3NcbiAqIG9uZSB0byBidWZmZXIgdXAgYSBkb3dubG9hZCBmcm9tIGEgc29ja2V0LiBCdWZmZXIgZ3Jvd3MgYW5kIHNocmlua3MgYXNcbiAqIG5lY2Vzc2FyeS5cbiAqXG4gKiBCdWZmZXIgaXMgTk9UIHRoZSBzYW1lIHRoaW5nIGFzIE5vZGUncyBCdWZmZXIuIE5vZGUncyBCdWZmZXIgd2FzIGNyZWF0ZWQgaW5cbiAqIDIwMDkgYmVmb3JlIEphdmFTY3JpcHQgaGFkIHRoZSBjb25jZXB0IG9mIEFycmF5QnVmZmVycy4gSXQncyBzaW1wbHkgYVxuICogbm9uLXN0YW5kYXJkIEFycmF5QnVmZmVyLlxuICpcbiAqIEFycmF5QnVmZmVyIGlzIGEgZml4ZWQgbWVtb3J5IGFsbG9jYXRpb24uIEJ1ZmZlciBpcyBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAqIEFycmF5QnVmZmVyLlxuICpcbiAqIEJhc2VkIG9uIFtHbyBCdWZmZXJdKGh0dHBzOi8vZ29sYW5nLm9yZy9wa2cvYnl0ZXMvI0J1ZmZlcikuICovXG5cbmV4cG9ydCBjbGFzcyBCdWZmZXIge1xuICAjYnVmOiBVaW50OEFycmF5OyAvLyBjb250ZW50cyBhcmUgdGhlIGJ5dGVzIGJ1ZltvZmYgOiBsZW4oYnVmKV1cbiAgI29mZiA9IDA7IC8vIHJlYWQgYXQgYnVmW29mZl0sIHdyaXRlIGF0IGJ1ZltidWYuYnl0ZUxlbmd0aF1cblxuICBjb25zdHJ1Y3RvcihhYj86IEFycmF5QnVmZmVyTGlrZSB8IEFycmF5TGlrZTxudW1iZXI+KSB7XG4gICAgdGhpcy4jYnVmID0gYWIgPT09IHVuZGVmaW5lZCA/IG5ldyBVaW50OEFycmF5KDApIDogbmV3IFVpbnQ4QXJyYXkoYWIpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBzbGljZSBob2xkaW5nIHRoZSB1bnJlYWQgcG9ydGlvbiBvZiB0aGUgYnVmZmVyLlxuICAgKlxuICAgKiBUaGUgc2xpY2UgaXMgdmFsaWQgZm9yIHVzZSBvbmx5IHVudGlsIHRoZSBuZXh0IGJ1ZmZlciBtb2RpZmljYXRpb24gKHRoYXRcbiAgICogaXMsIG9ubHkgdW50aWwgdGhlIG5leHQgY2FsbCB0byBhIG1ldGhvZCBsaWtlIGByZWFkKClgLCBgd3JpdGUoKWAsXG4gICAqIGByZXNldCgpYCwgb3IgYHRydW5jYXRlKClgKS4gSWYgYG9wdGlvbnMuY29weWAgaXMgZmFsc2UgdGhlIHNsaWNlIGFsaWFzZXMgdGhlIGJ1ZmZlciBjb250ZW50IGF0XG4gICAqIGxlYXN0IHVudGlsIHRoZSBuZXh0IGJ1ZmZlciBtb2RpZmljYXRpb24sIHNvIGltbWVkaWF0ZSBjaGFuZ2VzIHRvIHRoZVxuICAgKiBzbGljZSB3aWxsIGFmZmVjdCB0aGUgcmVzdWx0IG9mIGZ1dHVyZSByZWFkcy5cbiAgICogQHBhcmFtIFtvcHRpb25zPXsgY29weTogdHJ1ZSB9XVxuICAgKi9cbiAgYnl0ZXMob3B0aW9ucyA9IHsgY29weTogdHJ1ZSB9KTogVWludDhBcnJheSB7XG4gICAgaWYgKG9wdGlvbnMuY29weSA9PT0gZmFsc2UpIHJldHVybiB0aGlzLiNidWYuc3ViYXJyYXkodGhpcy4jb2ZmKTtcbiAgICByZXR1cm4gdGhpcy4jYnVmLnNsaWNlKHRoaXMuI29mZik7XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIHRoZSB1bnJlYWQgcG9ydGlvbiBvZiB0aGUgYnVmZmVyIGlzIGVtcHR5LiAqL1xuICBlbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jYnVmLmJ5dGVMZW5ndGggPD0gdGhpcy4jb2ZmO1xuICB9XG5cbiAgLyoqIEEgcmVhZCBvbmx5IG51bWJlciBvZiBieXRlcyBvZiB0aGUgdW5yZWFkIHBvcnRpb24gb2YgdGhlIGJ1ZmZlci4gKi9cbiAgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLiNidWYuYnl0ZUxlbmd0aCAtIHRoaXMuI29mZjtcbiAgfVxuXG4gIC8qKiBUaGUgcmVhZCBvbmx5IGNhcGFjaXR5IG9mIHRoZSBidWZmZXIncyB1bmRlcmx5aW5nIGJ5dGUgc2xpY2UsIHRoYXQgaXMsXG4gICAqIHRoZSB0b3RhbCBzcGFjZSBhbGxvY2F0ZWQgZm9yIHRoZSBidWZmZXIncyBkYXRhLiAqL1xuICBnZXQgY2FwYWNpdHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy4jYnVmLmJ1ZmZlci5ieXRlTGVuZ3RoO1xuICB9XG5cbiAgLyoqIERpc2NhcmRzIGFsbCBidXQgdGhlIGZpcnN0IGBuYCB1bnJlYWQgYnl0ZXMgZnJvbSB0aGUgYnVmZmVyIGJ1dFxuICAgKiBjb250aW51ZXMgdG8gdXNlIHRoZSBzYW1lIGFsbG9jYXRlZCBzdG9yYWdlLiBJdCB0aHJvd3MgaWYgYG5gIGlzXG4gICAqIG5lZ2F0aXZlIG9yIGdyZWF0ZXIgdGhhbiB0aGUgbGVuZ3RoIG9mIHRoZSBidWZmZXIuICovXG4gIHRydW5jYXRlKG46IG51bWJlcikge1xuICAgIGlmIChuID09PSAwKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChuIDwgMCB8fCBuID4gdGhpcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKFwiYnl0ZXMuQnVmZmVyOiB0cnVuY2F0aW9uIG91dCBvZiByYW5nZVwiKTtcbiAgICB9XG4gICAgdGhpcy4jcmVzbGljZSh0aGlzLiNvZmYgKyBuKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuI3Jlc2xpY2UoMCk7XG4gICAgdGhpcy4jb2ZmID0gMDtcbiAgfVxuXG4gICN0cnlHcm93QnlSZXNsaWNlKG46IG51bWJlcikge1xuICAgIGNvbnN0IGwgPSB0aGlzLiNidWYuYnl0ZUxlbmd0aDtcbiAgICBpZiAobiA8PSB0aGlzLmNhcGFjaXR5IC0gbCkge1xuICAgICAgdGhpcy4jcmVzbGljZShsICsgbik7XG4gICAgICByZXR1cm4gbDtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgI3Jlc2xpY2UobGVuOiBudW1iZXIpIHtcbiAgICBhc3NlcnQobGVuIDw9IHRoaXMuI2J1Zi5idWZmZXIuYnl0ZUxlbmd0aCk7XG4gICAgdGhpcy4jYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy4jYnVmLmJ1ZmZlciwgMCwgbGVuKTtcbiAgfVxuXG4gIC8qKiBSZWFkcyB0aGUgbmV4dCBgcC5sZW5ndGhgIGJ5dGVzIGZyb20gdGhlIGJ1ZmZlciBvciB1bnRpbCB0aGUgYnVmZmVyIGlzXG4gICAqIGRyYWluZWQuIFJldHVybnMgdGhlIG51bWJlciBvZiBieXRlcyByZWFkLiBJZiB0aGUgYnVmZmVyIGhhcyBubyBkYXRhIHRvXG4gICAqIHJldHVybiwgdGhlIHJldHVybiBpcyBFT0YgKGBudWxsYCkuICovXG4gIHJlYWRTeW5jKHA6IFVpbnQ4QXJyYXkpOiBudW1iZXIgfCBudWxsIHtcbiAgICBpZiAodGhpcy5lbXB0eSgpKSB7XG4gICAgICAvLyBCdWZmZXIgaXMgZW1wdHksIHJlc2V0IHRvIHJlY292ZXIgc3BhY2UuXG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICBpZiAocC5ieXRlTGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIHRoaXMgZWRnZSBjYXNlIGlzIHRlc3RlZCBpbiAnYnVmZmVyUmVhZEVtcHR5QXRFT0YnIHRlc3RcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbnJlYWQgPSBjb3B5KHRoaXMuI2J1Zi5zdWJhcnJheSh0aGlzLiNvZmYpLCBwKTtcbiAgICB0aGlzLiNvZmYgKz0gbnJlYWQ7XG4gICAgcmV0dXJuIG5yZWFkO1xuICB9XG5cbiAgLyoqIFJlYWRzIHRoZSBuZXh0IGBwLmxlbmd0aGAgYnl0ZXMgZnJvbSB0aGUgYnVmZmVyIG9yIHVudGlsIHRoZSBidWZmZXIgaXNcbiAgICogZHJhaW5lZC4gUmVzb2x2ZXMgdG8gdGhlIG51bWJlciBvZiBieXRlcyByZWFkLiBJZiB0aGUgYnVmZmVyIGhhcyBub1xuICAgKiBkYXRhIHRvIHJldHVybiwgcmVzb2x2ZXMgdG8gRU9GIChgbnVsbGApLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1ldGhvZHMgcmVhZHMgYnl0ZXMgc3luY2hyb25vdXNseTsgaXQncyBwcm92aWRlZCBmb3JcbiAgICogY29tcGF0aWJpbGl0eSB3aXRoIGBSZWFkZXJgIGludGVyZmFjZXMuXG4gICAqL1xuICByZWFkKHA6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBjb25zdCByciA9IHRoaXMucmVhZFN5bmMocCk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShycik7XG4gIH1cblxuICB3cml0ZVN5bmMocDogVWludDhBcnJheSk6IG51bWJlciB7XG4gICAgY29uc3QgbSA9IHRoaXMuI2dyb3cocC5ieXRlTGVuZ3RoKTtcbiAgICByZXR1cm4gY29weShwLCB0aGlzLiNidWYsIG0pO1xuICB9XG5cbiAgLyoqIE5PVEU6IFRoaXMgbWV0aG9kcyB3cml0ZXMgYnl0ZXMgc3luY2hyb25vdXNseTsgaXQncyBwcm92aWRlZCBmb3JcbiAgICogY29tcGF0aWJpbGl0eSB3aXRoIGBXcml0ZXJgIGludGVyZmFjZS4gKi9cbiAgd3JpdGUocDogVWludDhBcnJheSk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgbiA9IHRoaXMud3JpdGVTeW5jKHApO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobik7XG4gIH1cblxuICAjZ3JvdyhuOiBudW1iZXIpIHtcbiAgICBjb25zdCBtID0gdGhpcy5sZW5ndGg7XG4gICAgLy8gSWYgYnVmZmVyIGlzIGVtcHR5LCByZXNldCB0byByZWNvdmVyIHNwYWNlLlxuICAgIGlmIChtID09PSAwICYmIHRoaXMuI29mZiAhPT0gMCkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cbiAgICAvLyBGYXN0OiBUcnkgdG8gZ3JvdyBieSBtZWFucyBvZiBhIHJlc2xpY2UuXG4gICAgY29uc3QgaSA9IHRoaXMuI3RyeUdyb3dCeVJlc2xpY2Uobik7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICAgIGNvbnN0IGMgPSB0aGlzLmNhcGFjaXR5O1xuICAgIGlmIChuIDw9IE1hdGguZmxvb3IoYyAvIDIpIC0gbSkge1xuICAgICAgLy8gV2UgY2FuIHNsaWRlIHRoaW5ncyBkb3duIGluc3RlYWQgb2YgYWxsb2NhdGluZyBhIG5ld1xuICAgICAgLy8gQXJyYXlCdWZmZXIuIFdlIG9ubHkgbmVlZCBtK24gPD0gYyB0byBzbGlkZSwgYnV0XG4gICAgICAvLyB3ZSBpbnN0ZWFkIGxldCBjYXBhY2l0eSBnZXQgdHdpY2UgYXMgbGFyZ2Ugc28gd2VcbiAgICAgIC8vIGRvbid0IHNwZW5kIGFsbCBvdXIgdGltZSBjb3B5aW5nLlxuICAgICAgY29weSh0aGlzLiNidWYuc3ViYXJyYXkodGhpcy4jb2ZmKSwgdGhpcy4jYnVmKTtcbiAgICB9IGVsc2UgaWYgKGMgKyBuID4gTUFYX1NJWkUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBidWZmZXIgY2Fubm90IGJlIGdyb3duIGJleW9uZCB0aGUgbWF4aW11bSBzaXplLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm90IGVub3VnaCBzcGFjZSBhbnl3aGVyZSwgd2UgbmVlZCB0byBhbGxvY2F0ZS5cbiAgICAgIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KE1hdGgubWluKDIgKiBjICsgbiwgTUFYX1NJWkUpKTtcbiAgICAgIGNvcHkodGhpcy4jYnVmLnN1YmFycmF5KHRoaXMuI29mZiksIGJ1Zik7XG4gICAgICB0aGlzLiNidWYgPSBidWY7XG4gICAgfVxuICAgIC8vIFJlc3RvcmUgdGhpcy4jb2ZmIGFuZCBsZW4odGhpcy4jYnVmKS5cbiAgICB0aGlzLiNvZmYgPSAwO1xuICAgIHRoaXMuI3Jlc2xpY2UoTWF0aC5taW4obSArIG4sIE1BWF9TSVpFKSk7XG4gICAgcmV0dXJuIG07XG4gIH1cblxuICAvKiogR3Jvd3MgdGhlIGJ1ZmZlcidzIGNhcGFjaXR5LCBpZiBuZWNlc3NhcnksIHRvIGd1YXJhbnRlZSBzcGFjZSBmb3JcbiAgICogYW5vdGhlciBgbmAgYnl0ZXMuIEFmdGVyIGAuZ3JvdyhuKWAsIGF0IGxlYXN0IGBuYCBieXRlcyBjYW4gYmUgd3JpdHRlbiB0b1xuICAgKiB0aGUgYnVmZmVyIHdpdGhvdXQgYW5vdGhlciBhbGxvY2F0aW9uLiBJZiBgbmAgaXMgbmVnYXRpdmUsIGAuZ3JvdygpYCB3aWxsXG4gICAqIHRocm93LiBJZiB0aGUgYnVmZmVyIGNhbid0IGdyb3cgaXQgd2lsbCB0aHJvdyBhbiBlcnJvci5cbiAgICpcbiAgICogQmFzZWQgb24gR28gTGFuZydzXG4gICAqIFtCdWZmZXIuR3Jvd10oaHR0cHM6Ly9nb2xhbmcub3JnL3BrZy9ieXRlcy8jQnVmZmVyLkdyb3cpLiAqL1xuICBncm93KG46IG51bWJlcikge1xuICAgIGlmIChuIDwgMCkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJCdWZmZXIuZ3JvdzogbmVnYXRpdmUgY291bnRcIik7XG4gICAgfVxuICAgIGNvbnN0IG0gPSB0aGlzLiNncm93KG4pO1xuICAgIHRoaXMuI3Jlc2xpY2UobSk7XG4gIH1cblxuICAvKiogUmVhZHMgZGF0YSBmcm9tIGByYCB1bnRpbCBFT0YgKGBudWxsYCkgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIGJ1ZmZlcixcbiAgICogZ3Jvd2luZyB0aGUgYnVmZmVyIGFzIG5lZWRlZC4gSXQgcmVzb2x2ZXMgdG8gdGhlIG51bWJlciBvZiBieXRlcyByZWFkLlxuICAgKiBJZiB0aGUgYnVmZmVyIGJlY29tZXMgdG9vIGxhcmdlLCBgLnJlYWRGcm9tKClgIHdpbGwgcmVqZWN0IHdpdGggYW4gZXJyb3IuXG4gICAqXG4gICAqIEJhc2VkIG9uIEdvIExhbmcnc1xuICAgKiBbQnVmZmVyLlJlYWRGcm9tXShodHRwczovL2dvbGFuZy5vcmcvcGtnL2J5dGVzLyNCdWZmZXIuUmVhZEZyb20pLiAqL1xuICBhc3luYyByZWFkRnJvbShyOiBSZWFkZXIpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBuID0gMDtcbiAgICBjb25zdCB0bXAgPSBuZXcgVWludDhBcnJheShNSU5fUkVBRCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IHNob3VsZEdyb3cgPSB0aGlzLmNhcGFjaXR5IC0gdGhpcy5sZW5ndGggPCBNSU5fUkVBRDtcbiAgICAgIC8vIHJlYWQgaW50byB0bXAgYnVmZmVyIGlmIHRoZXJlJ3Mgbm90IGVub3VnaCByb29tXG4gICAgICAvLyBvdGhlcndpc2UgcmVhZCBkaXJlY3RseSBpbnRvIHRoZSBpbnRlcm5hbCBidWZmZXJcbiAgICAgIGNvbnN0IGJ1ZiA9IHNob3VsZEdyb3dcbiAgICAgICAgPyB0bXBcbiAgICAgICAgOiBuZXcgVWludDhBcnJheSh0aGlzLiNidWYuYnVmZmVyLCB0aGlzLmxlbmd0aCk7XG5cbiAgICAgIGNvbnN0IG5yZWFkID0gYXdhaXQgci5yZWFkKGJ1Zik7XG4gICAgICBpZiAobnJlYWQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG47XG4gICAgICB9XG5cbiAgICAgIC8vIHdyaXRlIHdpbGwgZ3JvdyBpZiBuZWVkZWRcbiAgICAgIGlmIChzaG91bGRHcm93KSB0aGlzLndyaXRlU3luYyhidWYuc3ViYXJyYXkoMCwgbnJlYWQpKTtcbiAgICAgIGVsc2UgdGhpcy4jcmVzbGljZSh0aGlzLmxlbmd0aCArIG5yZWFkKTtcblxuICAgICAgbiArPSBucmVhZDtcbiAgICB9XG4gIH1cblxuICAvKiogUmVhZHMgZGF0YSBmcm9tIGByYCB1bnRpbCBFT0YgKGBudWxsYCkgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIGJ1ZmZlcixcbiAgICogZ3Jvd2luZyB0aGUgYnVmZmVyIGFzIG5lZWRlZC4gSXQgcmV0dXJucyB0aGUgbnVtYmVyIG9mIGJ5dGVzIHJlYWQuIElmIHRoZVxuICAgKiBidWZmZXIgYmVjb21lcyB0b28gbGFyZ2UsIGAucmVhZEZyb21TeW5jKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IuXG4gICAqXG4gICAqIEJhc2VkIG9uIEdvIExhbmcnc1xuICAgKiBbQnVmZmVyLlJlYWRGcm9tXShodHRwczovL2dvbGFuZy5vcmcvcGtnL2J5dGVzLyNCdWZmZXIuUmVhZEZyb20pLiAqL1xuICByZWFkRnJvbVN5bmMocjogUmVhZGVyU3luYyk6IG51bWJlciB7XG4gICAgbGV0IG4gPSAwO1xuICAgIGNvbnN0IHRtcCA9IG5ldyBVaW50OEFycmF5KE1JTl9SRUFEKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3Qgc2hvdWxkR3JvdyA9IHRoaXMuY2FwYWNpdHkgLSB0aGlzLmxlbmd0aCA8IE1JTl9SRUFEO1xuICAgICAgLy8gcmVhZCBpbnRvIHRtcCBidWZmZXIgaWYgdGhlcmUncyBub3QgZW5vdWdoIHJvb21cbiAgICAgIC8vIG90aGVyd2lzZSByZWFkIGRpcmVjdGx5IGludG8gdGhlIGludGVybmFsIGJ1ZmZlclxuICAgICAgY29uc3QgYnVmID0gc2hvdWxkR3Jvd1xuICAgICAgICA/IHRtcFxuICAgICAgICA6IG5ldyBVaW50OEFycmF5KHRoaXMuI2J1Zi5idWZmZXIsIHRoaXMubGVuZ3RoKTtcblxuICAgICAgY29uc3QgbnJlYWQgPSByLnJlYWRTeW5jKGJ1Zik7XG4gICAgICBpZiAobnJlYWQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG47XG4gICAgICB9XG5cbiAgICAgIC8vIHdyaXRlIHdpbGwgZ3JvdyBpZiBuZWVkZWRcbiAgICAgIGlmIChzaG91bGRHcm93KSB0aGlzLndyaXRlU3luYyhidWYuc3ViYXJyYXkoMCwgbnJlYWQpKTtcbiAgICAgIGVsc2UgdGhpcy4jcmVzbGljZSh0aGlzLmxlbmd0aCArIG5yZWFkKTtcblxuICAgICAgbiArPSBucmVhZDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgLyoqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMC4xNzIuMCkgSW1wb3J0IGZyb20gYHN0ZC9pby9idWZfcmVhZGVyLnRzYCBpbnN0ZWFkICovXG4gIEJ1ZmZlckZ1bGxFcnJvcixcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMC4xNzIuMCkgSW1wb3J0IGZyb20gYHN0ZC9pby9idWZfcmVhZGVyLnRzYCBpbnN0ZWFkXG4gICAqXG4gICAqIEJ1ZlJlYWRlciBpbXBsZW1lbnRzIGJ1ZmZlcmluZyBmb3IgYSBSZWFkZXIgb2JqZWN0LlxuICAgKi9cbiAgQnVmUmVhZGVyLFxuICAvKiogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBhZnRlciAwLjE3Mi4wKSBJbXBvcnQgZnJvbSBgc3RkL2lvL2J1Zl9yZWFkZXIudHNgIGluc3RlYWQgKi9cbiAgUGFydGlhbFJlYWRFcnJvcixcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMC4xNzIuMCkgSW1wb3J0IGZyb20gYHN0ZC9pby9idWZfcmVhZGVyLnRzYCBpbnN0ZWFkXG4gICAqXG4gICAqIFJlc3VsdCB0eXBlIHJldHVybmVkIGJ5IG9mIEJ1ZlJlYWRlci5yZWFkTGluZSgpLlxuICAgKi9cbiAgdHlwZSBSZWFkTGluZVJlc3VsdCxcbn0gZnJvbSBcIi4vYnVmX3JlYWRlci50c1wiO1xuXG5leHBvcnQge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBhZnRlciAwLjE3Mi4wKSBJbXBvcnQgZnJvbSBgc3RkL2lvL2J1Zl93cml0ZXIudHNgIGluc3RlYWRcbiAgICpcbiAgICogQnVmV3JpdGVyIGltcGxlbWVudHMgYnVmZmVyaW5nIGZvciBhbiBkZW5vLldyaXRlciBvYmplY3QuXG4gICAqIElmIGFuIGVycm9yIG9jY3VycyB3cml0aW5nIHRvIGEgV3JpdGVyLCBubyBtb3JlIGRhdGEgd2lsbCBiZVxuICAgKiBhY2NlcHRlZCBhbmQgYWxsIHN1YnNlcXVlbnQgd3JpdGVzLCBhbmQgZmx1c2goKSwgd2lsbCByZXR1cm4gdGhlIGVycm9yLlxuICAgKiBBZnRlciBhbGwgZGF0YSBoYXMgYmVlbiB3cml0dGVuLCB0aGUgY2xpZW50IHNob3VsZCBjYWxsIHRoZVxuICAgKiBmbHVzaCgpIG1ldGhvZCB0byBndWFyYW50ZWUgYWxsIGRhdGEgaGFzIGJlZW4gZm9yd2FyZGVkIHRvXG4gICAqIHRoZSB1bmRlcmx5aW5nIGRlbm8uV3JpdGVyLlxuICAgKi9cbiAgQnVmV3JpdGVyLFxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBhZnRlciAwLjE3Mi4wKSBJbXBvcnQgZnJvbSBgc3RkL2lvL2J1Zl93cml0ZXIudHNgIGluc3RlYWRcbiAgICpcbiAgICogQnVmV3JpdGVyU3luYyBpbXBsZW1lbnRzIGJ1ZmZlcmluZyBmb3IgYSBkZW5vLldyaXRlclN5bmMgb2JqZWN0LlxuICAgKiBJZiBhbiBlcnJvciBvY2N1cnMgd3JpdGluZyB0byBhIFdyaXRlclN5bmMsIG5vIG1vcmUgZGF0YSB3aWxsIGJlXG4gICAqIGFjY2VwdGVkIGFuZCBhbGwgc3Vic2VxdWVudCB3cml0ZXMsIGFuZCBmbHVzaCgpLCB3aWxsIHJldHVybiB0aGUgZXJyb3IuXG4gICAqIEFmdGVyIGFsbCBkYXRhIGhhcyBiZWVuIHdyaXR0ZW4sIHRoZSBjbGllbnQgc2hvdWxkIGNhbGwgdGhlXG4gICAqIGZsdXNoKCkgbWV0aG9kIHRvIGd1YXJhbnRlZSBhbGwgZGF0YSBoYXMgYmVlbiBmb3J3YXJkZWQgdG9cbiAgICogdGhlIHVuZGVybHlpbmcgZGVuby5Xcml0ZXJTeW5jLlxuICAgKi9cbiAgQnVmV3JpdGVyU3luYyxcbn0gZnJvbSBcIi4vYnVmX3dyaXRlci50c1wiO1xuXG5leHBvcnQge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBhZnRlciAwLjE3Mi4wKSBJbXBvcnQgZnJvbSBgc3RkL2lvL3JlYWRfZGVsaW0udHNgIGluc3RlYWRcbiAgICpcbiAgICogUmVhZCBkZWxpbWl0ZWQgYnl0ZXMgZnJvbSBhIFJlYWRlci4gKi9cbiAgcmVhZERlbGltLFxufSBmcm9tIFwiLi9yZWFkX2RlbGltLnRzXCI7XG5cbmV4cG9ydCB7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCAod2lsbCBiZSByZW1vdmVkIGFmdGVyIDAuMTcyLjApIEltcG9ydCBmcm9tIGBzdGQvaW8vcmVhZF9zdHJpbmdfZGVsaW0udHNgIGluc3RlYWRcbiAgICpcbiAgICogUmVhZCBSZWFkZXIgY2h1bmsgYnkgY2h1bmssIHNwbGl0dGluZyBiYXNlZCBvbiBkZWxpbWl0ZXIuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IHJlYWRTdHJpbmdEZWxpbSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2lvL21vZC50c1wiO1xuICAgKiBpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3BhdGgvbW9kLnRzXCI7XG4gICAqXG4gICAqIGNvbnN0IGZpbGVuYW1lID0gcGF0aC5qb2luKERlbm8uY3dkKCksIFwic3RkL2lvL1JFQURNRS5tZFwiKTtcbiAgICogbGV0IGZpbGVSZWFkZXIgPSBhd2FpdCBEZW5vLm9wZW4oZmlsZW5hbWUpO1xuICAgKlxuICAgKiBmb3IgYXdhaXQgKGxldCBsaW5lIG9mIHJlYWRTdHJpbmdEZWxpbShmaWxlUmVhZGVyLCBcIlxcblwiKSkge1xuICAgKiAgIGNvbnNvbGUubG9nKGxpbmUpO1xuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgcmVhZFN0cmluZ0RlbGltLFxufSBmcm9tIFwiLi9yZWFkX3N0cmluZ19kZWxpbS50c1wiO1xuXG5leHBvcnQge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBhZnRlciAwLjE3Mi4wKSBJbXBvcnQgZnJvbSBgc3RkL2lvL3JlYWRfbGluZXMudHNgIGluc3RlYWRcbiAgICpcbiAgICogUmVhZCBzdHJpbmdzIGxpbmUtYnktbGluZSBmcm9tIGEgUmVhZGVyLlxuICAgKlxuICAgKiAgQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgcmVhZExpbmVzIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaW8vbW9kLnRzXCI7XG4gICAqIGltcG9ydCAqIGFzIHBhdGggZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vcGF0aC9tb2QudHNcIjtcbiAgICpcbiAgICogY29uc3QgZmlsZW5hbWUgPSBwYXRoLmpvaW4oRGVuby5jd2QoKSwgXCJzdGQvaW8vUkVBRE1FLm1kXCIpO1xuICAgKiBsZXQgZmlsZVJlYWRlciA9IGF3YWl0IERlbm8ub3BlbihmaWxlbmFtZSk7XG4gICAqXG4gICAqIGZvciBhd2FpdCAobGV0IGxpbmUgb2YgcmVhZExpbmVzKGZpbGVSZWFkZXIpKSB7XG4gICAqICAgY29uc29sZS5sb2cobGluZSk7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICByZWFkTGluZXMsXG59IGZyb20gXCIuL3JlYWRfbGluZXMudHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBUyxNQUFNLFFBQVEsc0JBQXNCO0FBQzdDLFNBQVMsSUFBSSxRQUFRLG1CQUFtQjtBQUd4QyxvRUFBb0U7QUFDcEUsNEVBQTRFO0FBQzVFLDJFQUEyRTtBQUMzRSxxQkFBcUI7QUFDckIsTUFBTSxXQUFXLEtBQUs7QUFDdEIsTUFBTSxXQUFXLEtBQUssS0FBSztBQUUzQjs7Ozs7Ozs7Ozs7OzsrREFhK0QsR0FFL0QsT0FBTyxNQUFNO0lBQ1gsQ0FBQyxHQUFHLENBQWE7SUFDakIsQ0FBQyxHQUFHLEdBQUcsRUFBRTtJQUVULFlBQVksRUFBd0MsQ0FBRTtRQUNwRCxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxZQUFZLElBQUksV0FBVyxLQUFLLElBQUksV0FBVyxHQUFHO0lBQ3ZFO0lBRUE7Ozs7Ozs7O0dBUUMsR0FDRCxNQUFNLFVBQVU7UUFBRSxNQUFNLElBQUk7SUFBQyxDQUFDLEVBQWM7UUFDMUMsSUFBSSxRQUFRLElBQUksS0FBSyxLQUFLLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUc7UUFDL0QsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUc7SUFDbEM7SUFFQSwrREFBK0QsR0FDL0QsUUFBaUI7UUFDZixPQUFPLElBQUksQ0FBQyxDQUFD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