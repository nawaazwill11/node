function prom() {
    return new Promise((resolve, reject) => {
        return(2 + 2);
    });
}

async function callprom() {
    let val = await prom().then(val => { console.log(val); });
    console.log('finised');
}
console.log('here');
callprom();

