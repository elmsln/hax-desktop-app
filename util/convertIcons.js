const icongen = require('icon-gen');
 
const options = {
  report: true
};
 
icongen('./assets/icons/hax.svg', './assets/icons/dist', options)
.then((results) => {
  console.log(results)
})
.catch((err) => {
  console.error(err)
});