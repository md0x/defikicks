"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const getIpfsFile = async (ipfsHash) => {
    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://w3s.link/ipfs/" + ipfsHash,
        headers: {},
    };
    axios_1.default
        .request(config)
        .then((response) => {
        console.log(JSON.stringify(response.data));
    })
        .catch((error) => {
        console.log(error);
    });
};
async function run() {
    const proposalId = process.env.PROPOSAL_ID;
    const rootVotes = process.env.ROOT_VOTES;
    const test = await getIpfsFile("QmNjkECL37oveLZuFuNHNWfpYSaWeBUYFkrDPeoqQWoTLQ");
    console.log(test);
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUF5QjtBQUV6QixNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO0lBQzNDLElBQUksTUFBTSxHQUFHO1FBQ1QsTUFBTSxFQUFFLEtBQUs7UUFDYixhQUFhLEVBQUUsUUFBUTtRQUN2QixHQUFHLEVBQUUsd0JBQXdCLEdBQUcsUUFBUTtRQUN4QyxPQUFPLEVBQUUsRUFBRTtLQUNkLENBQUE7SUFFRCxlQUFLO1NBQ0EsT0FBTyxDQUFDLE1BQU0sQ0FBQztTQUNmLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQzlDLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN0QixDQUFDLENBQUMsQ0FBQTtBQUNWLENBQUMsQ0FBQTtBQUVELEtBQUssVUFBVSxHQUFHO0lBQ2QsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUE7SUFDMUMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUE7SUFDeEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsZ0RBQWdELENBQUMsQ0FBQTtJQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3JCLENBQUM7QUFFRCxHQUFHLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIlxuXG5jb25zdCBnZXRJcGZzRmlsZSA9IGFzeW5jIChpcGZzSGFzaDogc3RyaW5nKSA9PiB7XG4gICAgbGV0IGNvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiBcImdldFwiLFxuICAgICAgICBtYXhCb2R5TGVuZ3RoOiBJbmZpbml0eSxcbiAgICAgICAgdXJsOiBcImh0dHBzOi8vdzNzLmxpbmsvaXBmcy9cIiArIGlwZnNIYXNoLFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICB9XG5cbiAgICBheGlvc1xuICAgICAgICAucmVxdWVzdChjb25maWcpXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UuZGF0YSkpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgICAgICB9KVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW4oKSB7XG4gICAgY29uc3QgcHJvcG9zYWxJZCA9IHByb2Nlc3MuZW52LlBST1BPU0FMX0lEXG4gICAgY29uc3Qgcm9vdFZvdGVzID0gcHJvY2Vzcy5lbnYuUk9PVF9WT1RFU1xuICAgIGNvbnN0IHRlc3QgPSBhd2FpdCBnZXRJcGZzRmlsZShcIlFtTmprRUNMMzdvdmVMWnVGdU5ITldmcFlTYVdlQlVZRmtyRFBlb3FRV29UTFFcIilcbiAgICBjb25zb2xlLmxvZyh0ZXN0KVxufVxuXG5ydW4oKVxuIl19