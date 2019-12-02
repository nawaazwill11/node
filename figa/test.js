let fsp = require("fs").promises;

try {
    await fsp.writeFile("/tmp/test5.js", "console.log('Hello world with Node.js v10 fs/promises!'");
    console.info("File created successfully with Node.js v10 fs/promises!");
} catch (error){
    console.error(error);
}