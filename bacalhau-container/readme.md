How to build this container
===========================

This container is built using the following command:

```bash
docker build -t maldoxxx/defikicks-vote:latest .
```

How to run this container
=========================
This container is run using the following command:

```bash 
docker run maldoxxx/defikicks-vote:latest
```

How to deploy this image to Docker Hub
======================================

```bash
docker login
export IMAGE=maldoxxx/defikicks-vote:latest
docker build -t {$IMAGE} .
docker image push {$IMAGE}
```

How to run with bacalhau
=========================

```bash
bacalhau docker run \
   --env PROPOSAL_ID={$PROPOSAL_ID} \
   --env NODE_URL={$NODE_URL} \
    {$IMAGE}
```

How to get the job spec
=======================

```bash
bacalhau describe <job_id> --json
```