import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=JSON.parse(readFileSync(new URL('../data/real_katsuramuki_photo_references_30.json',import.meta.url),'utf8'));
const photos=source.items;
test('photo reference collection has exactly thirty distinct source-linked images',()=>{
 assert.equal(photos.length,30);
 assert.equal(source.photo_count,30);
 assert.equal(source.source_page_count,new Set(photos.map(x=>x.source_page)).size);
 assert.equal(new Set(photos.map(x=>x.image_url.split('?')[0])).size,30);
 assert.equal(new Set(photos.map(x=>x.id)).size,30);
});
test('copyright-protected source images are linked rather than copied',()=>{
 assert.equal(source.embedded_image_copies,false);
 for(const x of photos){
   assert.match(x.id,/^KPHOTO-\d{3}$/);
   assert.equal(new URL(x.image_url).protocol,'https:');
   assert.equal(new URL(x.source_page).protocol,'https:');
   assert.equal(x.rights,'link_only_no_image_copied');
   assert.ok(['search_previewed','source_page_identified',
     'original_image_visually_inspected_partial'].includes(x.visual_review_status));
   assert.ok(['not_yet_rated','unmeasured_occlusions',
     '2d_view_only_unmeasured'].includes(x.angle_suitability));
 }
});

test('direct inspections and formal pose certifications remain separate',()=>{
 const inspected=photos.filter(x=>x.visual_review_status==='original_image_visually_inspected_partial');
 assert.equal(inspected.length,4);
 assert.deepEqual(inspected.map(x=>x.id).sort(),['KPHOTO-002','KPHOTO-007','KPHOTO-013','KPHOTO-026']);
 assert.equal(source.photo_image_individually_inspected,4);
 assert.equal(source.photo_pose_verified,0);
 assert.ok(inspected.every(x=>x.pose_validation==='not_yet_approved'));
});
