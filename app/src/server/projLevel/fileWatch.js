// import chokidar from 'chokidar';
// import { generateRsync } from './rsync';
// import Promise from 'bluebird';
//
// Promise.config({
//   cancellation: true,
// });
//
// /**
//  * addFileWatcher() watches the file system starting at the project's basePath
//  * and has an event listener, 'all', which runs rsync on changes to the project
//  * based on the passed in project object
//  *
//  * @param {Object} projObj
//  * @return {Emitter} all
//  */
// function fileWatch(projObj) {
//   const watcher = chokidar.watch(projObj.basePath);
//
//   const projectSync = generateRsync(projObj, 'machine');
//
//   function returnDelay(sync) {
//     return new Promise((resolve, reject, onCancel) => {
//       let tmpSync = sync;
//       const blank = () => {};
//       setTimeout(() => resolve(tmpSync()), 100);
//       onCancel(() => { tmpSync = blank; });
//     });
//   }
//
//   let last;
//   const throttleSync = () => {
//     if (!last || last.isPending()) {
//       if (last) last.cancel();
//       last = returnDelay(projectSync);
//     } else {
//       last = returnDelay(projectSync);
//     }
//   };
//
//   watcher.on('all', throttleSync);
//
//   return watcher;
// }
//
// export default fileWatch;
