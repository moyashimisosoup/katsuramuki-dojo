/** Pose lab bootstrap. Network errors (including a blocked Three.js CDN) must
 * never leave the phone on an endless "preparing" status.
 */
const status = document.getElementById('scene-status');
function showError(error){
  const message=String(error?.message||error||'unknown error');
  if(status){
    status.textContent='3D表示を開始できませんでした。通信・WebGL環境を確認し、画面の記載とともに報告してください。詳細: '+message.slice(0,180);
    status.style.background='#fff0e8';
    status.style.color='#723721';
  }
  console.error('APP-022 pose lab module initialization failed',error);
}
import('./pose-lab.js').catch(showError);
