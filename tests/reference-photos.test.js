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
   assert.ok(['search_previewed','source_page_identified'].includes(x.visual_review_status));
   assert.equal(x.angle_suitability,'not_yet_rated');
 }
});
