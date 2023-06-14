How to build this container
===========================

This container is built using the following command:

```bash
docker build -t bacalhau .
```

How to run this container
=========================
This container is run using the following command:

```bash 
docker run bacalhau:latest
```

How to deploy this image to Docker Hub
======================================

```bash
docker login
docker tag defikicks-vote-resolver:latest maldoxxx/defikicks-vote-resolver:latest
docker push maldoxxx/defikicks-vote-resolver:latest
```

How to run with bacalhau
=========================

```bash
bacalhau docker run \
   --env PROPOSAL_ID=bar \
   --env ROOT_VOTES=QmNjkECL37oveLZuFuNHNWfpYSaWeBUYFkrDPeoqQWoTLQ \
   --env NODE_URL=infura \
    maldoxxx/defikicks-vote-resolver:latest
```

How to get the job spec
=======================

```bash
bacalhau describe <job_id> --json
```