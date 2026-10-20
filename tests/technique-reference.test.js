import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ref=JSON.parse(readFileSync(new URL('../data/katsuramuki_technique_evidence_v1.json',import.meta.url),'utf8'));
test('technique registry counts are stable and sources are independently addressable',()=>{
 assert.equal(ref.text_sources.length,13);
 assert.equal(ref.videos.length,4);
 assert.equal(ref.claims.length,12);
 const all=[...ref.text_sources,...ref.videos];
 assert.equal(new Set(all.map(x=>x.id)).size,all.length);
 assert.ok(all.every(x=>new URL(x.url).protocol==='https:'));
});
test('every claim points to a registered text source, with no made-up video-frame verification',()=>{
 const ids=new Set(ref.text_sources.map(x=>x.id));
 assert.ok(ref.claims.every(x=>x.support.length>0&&x.support.every(id=>ids.has(id))));
 assert.equal(ref.pose_acceptance.video_frame_confirmation_count,0);
 assert.equal(ref.pose_acceptance.pose_model_approved,false);
 assert.ok(ref.videos.every(x=>x.timestamp_verified===false));
});
