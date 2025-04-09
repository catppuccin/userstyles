import { CalVer } from "./calver.ts";

import test from 'node:test';
import assert from 'node:assert/strict';

test("constructor",
  () => {
    const calver = new CalVer("2000.01.01");
    assert.equal(calver.toString(), "2000.01.01");
  },
);

test("incrementWith",
  () => {
    const calver = new CalVer("2000.01.01");
    calver.incrementWith(new Date("2000-01-01"));
    assert.equal(calver.toString(), "2000.01.01.1");
    calver.incrementWith(new Date("2000-01-01"));
    assert.equal(calver.toString(), "2000.01.01.2");
    calver.incrementWith(new Date("2000-01-02"));
    assert.equal(calver.toString(), "2000.01.02");
  },
);

test("incrementWith - new year",
  () => {
    const calver = new CalVer("2000.12.31");
    calver.incrementWith(new Date("2001-01-01"));
    assert.equal(calver.toString(), "2001.01.01");
  },
);

test("incrementWith - new month",
  () => {
    const calver = new CalVer("2000.01.31");
    calver.incrementWith(new Date("2000-02-01"));
    assert.equal(calver.toString(), "2000.02.01");
  },
);

test("incrementWith - earlier date",
  () => {
    const calver = new CalVer("2000.01.01");
    calver.incrementWith(new Date("1999-12-31"));
    assert.equal(calver.toString(), "1999.12.31");
  },
);
