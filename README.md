# Foot Patrol

[![pipeline status](https://incode.ca/capstone/foot-patrol/badges/develop/pipeline.svg)](https://incode.ca/capstone/foot-patrol/commits/develop)
[![coverage report](https://incode.ca/capstone/foot-patrol/badges/develop/coverage.svg)](https://incode.ca/capstone/foot-patrol/commits/develop)

## Introduction

This repository holds all the code for the Foot Patrol pickup-request mobile app.
This project was created by Darryl Murray, Kian Paliani, Michael Romao, and Rowan Collier
as the SE 4450 Capstone Project 2017-2018 year.

## Structure

```
foot-patrol
├── .gitlab
├── deploy
└── src
    ├── backend
    └── dispatch-website

```

`.gitlab/` contains issue and merge request templates for the development team to have consistent documentation.

`deploy/` contains a Helm chart for deploying the project onto a Kubernetes cluster.

`src/` contains the source code for the project.


The `Vagrantfile` and `install-runner-virtualbox.sh` files are for integrating
mobile build hosts with the GitLab CI system.