import { describe, expect, it } from 'vitest';
import { ADMIN_ACCOUNTS, appendAuditLog, createAdminSession, createLoginGuard, hashPassword, isSessionValid, touchSession, verifyPassword } from './adminSecurity.js';

describe('administrator security foundations', () => {
  it('supports exactly two administrator accounts and strong password verification', () => {
    expect(ADMIN_ACCOUNTS).toHaveLength(2);
    const encoded=hashPassword('correct horse battery staple');
    expect(verifyPassword('correct horse battery staple',encoded)).toBe(true);
    expect(verifyPassword('wrong password',encoded)).toBe(false);
  });
  it('expires, refreshes, and rejects administrator sessions', () => {
    const session=createAdminSession({adminId:'admin-1',now:1000,ttlMs:100});
    expect(isSessionValid(session,1050)).toBe(true);
    expect(isSessionValid(session,1101)).toBe(false);
    expect(touchSession(session,1050,100)).toMatchObject({adminId:'admin-1',expiresAt:1150});
    expect(touchSession(session,1101,100)).toBe(null);
  });
  it('rate limits login attempts and records audit events', () => {
    const guard=createLoginGuard({maxAttempts:2,windowMs:1000});
    expect(guard.allow('ip')).toBe(true); expect(guard.allow('ip')).toBe(true); expect(guard.allow('ip')).toBe(false);
    const log=appendAuditLog([],{actorId:'admin-1',action:'Login',targetType:'AdminSession',targetId:'s1'});
    expect(log[0]).toMatchObject({actorId:'admin-1',action:'Login'});
  });
});
