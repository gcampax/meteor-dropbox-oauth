Package.describe({
    name: 'vladgolubev:dropbox-oauth',
    summary: 'Login service for dropbox accounts',
    version: '2.0.0',
    git: 'https://github.com/vladgolubev/meteor-dropbox-oauth'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.1');

    // Third-party packages
    api.use('oauth', ['client', 'server']);
    api.use('oauth2', ['client', 'server']);
    api.use('templating', 'client');
    api.use('http', 'server');
    api.use('service-configuration', ['client', 'server']);

    // Package files
    api.addFiles([
        'client/dropbox_client.js',
        'client/dropbox_configure.html',
        'client/dropbox_configure.js'
    ], 'client');
    api.addFiles([
        'server/dropbox_server.js'
    ], 'server');

    // Exposed object
    api.export('DropboxOAuth');
});
