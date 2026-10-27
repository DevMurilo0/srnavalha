import { animate, cancelWithin, canMove } from './core.js';

// Filtering replaces a list in-place. Only visible results get a short reply;
// repeated clicks cancel older effects and keyboard changes are immediate.
export function revealList(rows, keyboard = false) {
  rows.forEach(cancelWithin);
  if (keyboard || !canMove()) return;
  const visible = rows.filter(row => {
    if (row.hidden) return false;
    const box = row.getBoundingClientRect();
    return box.height > 0 && box.bottom > 0 && box.top < innerHeight;
  }).slice(0,8);
  visible.forEach((row,index) => {
    const animation = animate(row,[
      {opacity:.4,transform:'translateX(8px)'},
      {opacity:1,transform:'none'}
    ],{duration:260,delay:index*25});
    if(animation)animation.id='sr-filter-result';
  });
}
