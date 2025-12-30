module.exports = [
"[project]/node_modules/firebase/auth/dist/index.mjs [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_firebase_auth_dist_index_mjs_f014b6ec._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/firebase/auth/dist/index.mjs [app-rsc] (ecmascript)");
    });
});
}),
"[project]/src/lib/firebase-database.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_ba758f95._.js",
  "server/chunks/ssr/src_lib_firebase-database_ts_81b20753._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/firebase-database.ts [app-rsc] (ecmascript)");
    });
});
}),
];