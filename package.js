Package.describe({
    name: 'vladgolubev:dropbox-oauth',
    summary: 'Login service for dropbox accounts',
    version: '2.0.0',
    git: 'https://github.com/vladgolubev/meteor-dropbox-oauth'
});

Package.onUse(function(api) {
    api.versionsFrom('1.2');
    api.use('oauth', ['client', 'server']);
    api.use('oauth2', ['client', 'server']);
    api.use('http', ['client', 'server']);
    api.use('templating', 'client');
    api.use('http', 'server');
    api.use('service-configuration', ['client', 'server']);

    api.export('DropboxOAuth');

    api.addFiles(['dropbox_configure.html', 'dropbox_configure.js'], 'client');
    api.addFiles('dropbox_server.js', 'server');
    api.addFiles('dropbox_client.js', 'client');
});
