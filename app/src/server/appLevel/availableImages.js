// list of available server images for the user
export const servers = [
  'node',
];

// list of available database images for the user
const dbs = [
  'redis',
  'mysql',
  'mongo',
  'postgres',
  'elasticsearch',
  'mariadb',
  'memcached',
  'neo4j',
  'rethinkdb',
  'cassandra',
  'couchbase',
];

export const logo = {
  redis: 'client/images/png/container-logos/redisdb.jpg',
  mysql: 'client/images/png/container-logos/mysqldb.jpg',
  mongo: 'client/images/png/container-logos/mongodb.jpg',
  postgres: 'client/images/png/container-logos/postgresqldb.jpg',
  elasticsearch: 'client/images/png/container-logos/elasticdb.jpg',
  mariadb: 'client/images/png/container-logos/mariadb.jpg',
  memcached: 'client/images/png/container-logos/memcachdb.jpg',
  neo4j: 'client/images/png/container-logos/neo4jdb.jpg',
  rethinkdb: 'client/images/png/container-logos/rethinkdb.jpg',
  cassandra: 'client/images/png/container-logos/cassandradb.jpg',
  couchbase: 'client/images/png/container-logos/couchbasedb.jpg',
  node: 'client/images/png/container-logos/nodedb.jpg',
  python: 'client/images/png/container-logos/pythondb.jpg',
  go: 'client/images/png/container-logos/godb.jpg',
};

export const dbPorts = {
  redis: 6379,
  mysql: 3306,
  mongo: 27017,
  postgres: 5432,
  elasticsearch: 9200,
  mariadb: 3306,
  memcached: 11211,
  neo4j: 7474,
  rethinkdb: 28015,
  cassandra: 7000,
  couchbase: 8091,
};

/**
* @param {Object} ImageObj has the name of the image and it's available versions
*/
function ImageObj(name, server) {
  this.name = name;
  this.versions = [];
  this.selected = false;
  this.used = false;
  this.server = server;
  this.available = true;
}

/**
 * getServers() returns a new Array of server image objects (ImageObj)
 * based on the servers array
 *
 * @return {Array} returns an Array of server image objects
 */
export function getServers() {
  return servers.map(val => new ImageObj(val, true));
}

/**
 * getDbs() returns a new Array of databse image objects (ImageObj)
 * based on the databases (dbs) array
 *
 * @return {Array} returns an Array of database image objects
 */
export function getDbs() {
  return dbs.map(val => new ImageObj(val, false));
}

export function getImages() {
  return [...getServers(), ...getDbs()];
}
