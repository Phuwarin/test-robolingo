import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {validSignature,token,validToken} from '../lib/security';
test('webhook verifies original bytes and rejects tampering',()=>{const body='{"events":[]}';const signature=createHmac('sha256','secret').update(body).digest('base64');assert.ok(validSignature(body,signature,'secret'));assert.equal(validSignature(body+' ',signature,'secret'),false);assert.equal(validSignature(body,'','secret'),false);});
test('session rejects expiry, tampering, and another secret',()=>{assert.ok(validToken(token('secret'),'secret'));assert.equal(validToken(token('secret',Date.now()-1),'secret'),false);assert.equal(validToken(token('secret'),'other'),false);assert.equal(validToken('broken','secret'),false);});
