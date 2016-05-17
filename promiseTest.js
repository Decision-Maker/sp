
var v = new Promise(function(resolve, reject){
  resolve({value: 2+2});
});
var p = {};
v.then(function(val){
  console.log('val: ', val);
  p = val;
  process.exit(0);
});
console.log('p.value: ', p.value);

//process.exit(0);
