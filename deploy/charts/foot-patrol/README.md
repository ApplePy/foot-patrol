# Foot Patrol

Deploys the Foot Patrol web app, backend, and single-node MySQL.

## Prerequisites

* Kubernetes 1.6+ with Beta APIs enabled
* PV provisioner support in the underlying infrastructure

## Installation

```bash
helm install --set appLabel=$CI_ENVIRONMENT_SLUG\
  ,db.host=*mysql_host*,db.username=*mysql_username*\
  ,db.password=*mysql_password*,db.database=*mysql_database* .
```

You can also add a namespace with `--namespace` if needed.

Remember to set `dockercfg` if image is private.

## Configuration

| Parameter                         | Description                                | Default                                   |
|-----------------------------------|--------------------------------------------|-------------------------------------------|
| `imageBase`                       | Location of Docker images.                 | `registry.incode.ca/capstone/foot-patrol` |
| `imageTag`                        | Image tag to use.                          | `master`                                  |
| `imagePullPolicy`                 | Image pull policy                          | `Always`                                  |
| `appLabel`                        | Set the `app` Label on containers.         | `replaceme`                               |
| `backend.name`                    | Name of the component in K8s               | `backend`                                 |
| `backend.imageName`               | Name of the Docker image for the backend.  | `backend`                                 |
| `backend.externalPort`            | Cluster-facing port number on the service. | `4200`                                    |
| `backend.internalPort`            | Service target port to container.          | `4200`                                    |
| `backend.replicas`                | Number of backend replicas to run.         | `1`                                       |
| `webapp.name`                     | Name of the component in K8s               | `backend`                                 |
| `webapp.imageName`                | Name of the Docker image for the webapp.   | `webapp`                                  |
| `webapp.externalPort`             | Cluster-facing port number on the service. | `4200`                                    |
| `webapp.internalPort`             | Service target port to container.          | `4200`                                    |
| `webapp.replicas`                 | Number of webapp replicas to run.          | `1`                                       |
| `ingress.enabled`                 | Provision an ingress for the app           | `true`                                    |
| `ingress.hosts`                   | List of DNS names to expose the app under. |                                           |
| `ingress.hosts.name`              | DNS name to use.                           | `capstone.incode.ca`                      |
| `ingress.hosts.paths`             | List of URL Rewrite paths to use           |                                           |
| `ingress.hosts.paths.path`        | URL path                                   | `/`                                       |
| `ingress.hosts.paths.serviceName` | Service to attach to this ingress.         | `backend`                                 |
| `ingress.hosts.paths.servicePort` | Service port to connect to.                | `4200`                                    |
| `ingress.tls`                     | List of DNS TLS settings for ingress       |                                           |
| `ingress.tls.secretName`          | K8s secret containing domain SSL cert      |                                           |
| `ingress.tls.hosts`               | List of hostnames this SSL cert covers     |                                           |
| `dockercfg`                       | Base-64-encoded docker config.json file    |                                           |
| `db`                              | Database connection parameters             |                                           |
| `db.host`                         | Database URL                               |                                           |
| `db.username`                     | Database connection username               |                                           |
| `db.password`                     | Database connection password               |                                           |
| `db.database`                     | Database connection database               |                                           |
