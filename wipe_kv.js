require("dotenv").config({path: ".env.local"});
const { Redis } = require("@upstash/redis");
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
redis.del("demo:clients").then(() => console.log("WIPED demo:clients"));
