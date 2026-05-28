/**
 * Firestore security-rules tests.
 *
 * Run with the Firebase emulator running:
 *     firebase emulators:start --only firestore
 *     npx jest tests/firestore.rules.test.js
 *
 * These tests intentionally aim for breadth, not depth — every `match`
 * block in firestore.rules should have at least one allow-case and one
 * deny-case here.
 */

import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'firesite-rules-test';
let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(() => testEnv.cleanup());
beforeEach(() => testEnv.clearFirestore());

const aliceUid = 'alice';
const bobUid   = 'bob';

const aliceCtx = () => testEnv.authenticatedContext(aliceUid).firestore();
const bobCtx   = () => testEnv.authenticatedContext(bobUid).firestore();
const anonCtx  = () => testEnv.unauthenticatedContext().firestore();

describe('users/{uid}', () => {
  test('anonymous user cannot read users/{anyUid}', async () => {
    await assertFails(getDoc(doc(anonCtx(), 'users', aliceUid)));
  });

  test('user can read their own profile', async () => {
    // Pre-seed via admin context to bypass rules during setup.
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', aliceUid), {
        email: 'alice@example.com', name: 'Alice', plan: 'free',
      });
    });
    await assertSucceeds(getDoc(doc(aliceCtx(), 'users', aliceUid)));
  });

  test('user CANNOT read another user profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', aliceUid), {
        email: 'alice@example.com', name: 'Alice', plan: 'free',
      });
    });
    await assertFails(getDoc(doc(bobCtx(), 'users', aliceUid)));
  });

  test('user can create their own profile with plan == "free"', async () => {
    await assertSucceeds(setDoc(doc(aliceCtx(), 'users', aliceUid), {
      email: 'alice@example.com', name: 'Alice', plan: 'free',
    }));
  });

  test('user CANNOT create their own profile with plan == "pro"', async () => {
    await assertFails(setDoc(doc(aliceCtx(), 'users', aliceUid), {
      email: 'alice@example.com', name: 'Alice', plan: 'pro',
    }));
  });

  test('user CANNOT self-elevate role to admin', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', aliceUid), {
        email: 'alice@example.com', name: 'Alice', plan: 'free', role: 'user',
      });
    });
    await assertFails(updateDoc(doc(aliceCtx(), 'users', aliceUid), {
      role: 'admin',
    }));
  });

  test('user CANNOT upgrade their own plan from free to pro', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', aliceUid), {
        email: 'alice@example.com', name: 'Alice', plan: 'free',
      });
    });
    await assertFails(updateDoc(doc(aliceCtx(), 'users', aliceUid), {
      plan: 'pro',
    }));
  });

  test('user CANNOT delete their own profile (server-only)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', aliceUid), {
        email: 'alice@example.com', name: 'Alice', plan: 'free',
      });
    });
    await assertFails(deleteDoc(doc(aliceCtx(), 'users', aliceUid)));
  });
});

describe('orgs/{orgId}', () => {
  const orgId = 'acme';

  test('non-member CANNOT read org doc', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'orgs', orgId), { name: 'Acme' });
    });
    await assertFails(getDoc(doc(aliceCtx(), 'orgs', orgId)));
  });

  test('member CAN read org doc', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'orgs', orgId), { name: 'Acme' });
      await setDoc(doc(ctx.firestore(), 'orgs', orgId, 'members', aliceUid), {
        role: 'assessor',
      });
    });
    await assertSucceeds(getDoc(doc(aliceCtx(), 'orgs', orgId)));
  });

  test('member CANNOT update an issued assessment', async () => {
    const assessmentId = 'a1';
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'orgs', orgId, 'members', aliceUid), {
        role: 'assessor',
      });
      await setDoc(doc(ctx.firestore(), 'orgs', orgId, 'assessments', assessmentId), {
        createdBy: aliceUid, status: 'issued',
      });
    });
    await assertFails(updateDoc(
      doc(aliceCtx(), 'orgs', orgId, 'assessments', assessmentId),
      { notes: 'try to edit' }
    ));
  });
});

describe('audit/* and orgs/{orgId}/reports/*', () => {
  test('nobody can write to audit from the client', async () => {
    await assertFails(setDoc(doc(aliceCtx(), 'audit', 'evt1'), {
      orgId: 'acme', kind: 'test',
    }));
  });

  test('nobody can write to orgs/{orgId}/reports from the client', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'orgs', 'acme', 'members', aliceUid), {
        role: 'admin',
      });
    });
    await assertFails(setDoc(
      doc(aliceCtx(), 'orgs', 'acme', 'reports', 'r1'),
      { issuedAt: Date.now() }
    ));
  });
});

describe('default deny', () => {
  test('unknown collection is denied even when authenticated', async () => {
    await assertFails(setDoc(doc(aliceCtx(), 'random_collection', 'x'), { a: 1 }));
    await assertFails(getDoc(doc(aliceCtx(), 'random_collection', 'x')));
  });
});
