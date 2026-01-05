import { CalVer } from "@/bump-version/calver.ts";

import { assertEquals } from "@std/assert";

Deno.test({
  name: "constructor",
  fn() {
    const calver = new CalVer("2000.01.01");
    assertEquals(calver.toString(), "2000.01.01");
  },
});

Deno.test({
  name: "incrementWith",
  fn() {
    const calver = new CalVer("2000.01.01");
    calver.incrementWith(new Date("2000-01-01"));
    assertEquals(calver.toString(), "2000.01.01.1");
    calver.incrementWith(new Date("2000-01-01"));
    assertEquals(calver.toString(), "2000.01.01.2");
    calver.incrementWith(new Date("2000-01-02"));
    assertEquals(calver.toString(), "2000.01.02");
  },
});

Deno.test({
  name: "incrementWith - new year",
  fn() {
    const calver = new CalVer("2000.12.31");
    calver.incrementWith(new Date("2001-01-01"));
    assertEquals(calver.toString(), "2001.01.01");
  },
});

Deno.test({
  name: "incrementWith - new month",
  fn() {
    const calver = new CalVer("2000.01.31");
    calver.incrementWith(new Date("2000-02-01"));
    assertEquals(calver.toString(), "2000.02.01");
  },
});

Deno.test({
  name: "incrementWith - earlier date",
  fn() {
    const calver = new CalVer("2000.01.01");
    calver.incrementWith(new Date("1999-12-31"));
    assertEquals(calver.toString(), "1999.12.31");
  },
});
