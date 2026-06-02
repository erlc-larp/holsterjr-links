module.exports = {
  apps: [{
    name: "links-api",
    script: "index.js",
    env: {
      ADMIN_KEY: "changeme",
      PORT: 4501
    }
  }]
};
