import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const audit=JSON.parse(readFileSync(new URL('../data/katsuramuki_motion_audit_20261020.json',import.meta.url),'utf8'));
const master=JSON.parse(readFileSync(new URL('../data/katsuramuki_technique_evidence_v1.json',import.meta.url),'utf8'));
test('verified motion transcript observations never claim video frame inspection',()=>{
 assert.equal(audit.observations.length,8);
 assert.equal(audit.primary_video.real_video_frames_examined,false);
 assert.equal(audit.primary_video.caption_has_exact_timestamps,false);
 assert.equal(audit.official_conclusions.actual_frame_sequences_verified,0);
 assert.ok(audit.observations.every(x=>x.timecode===null && x.image_verified===false));
 assert.ok(audit.observations.every(x=>x.support.includes('VID-01')));
});
test('motion profile distinguishes upstroke cutting from return stroke and angle remains unmeasured',()=>{
 assert.equal(audit.observations.find(x=>x.id==='MOT-05').model_attribute,'upstroke_rotation_enabled');
 assert.equal(audit.observations.find(x=>x.id==='MOT-06').model_attribute,'downstroke_rotation_disabled');
 assert.equal(audit.official_conclusions.physical_blade_face_angle_verified,false);
 const primary=master.videos.find(v=>v.id==='VID-01');
 assert.equal(primary.verified_level,'auto_transcript_text_read_untimed_no_frames');
 assert.equal(primary.timestamp_verified,false);
 assert.ok(audit.frame_audit_tasks.length>=5);
});
