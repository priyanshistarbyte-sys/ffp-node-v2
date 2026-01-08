const commonHelper = require('@/helper/common-helper');

const BEFORE_DAYS_MAKE_POST = new Date();
BEFORE_DAYS_MAKE_POST.setDate(BEFORE_DAYS_MAKE_POST.getDate() + 15);

const { API_BASE_URL } = process.env;

module.exports = {
  name: 'Free Festival Post',
  db: {
    database: 'ffp',
    user: 'root',
    pwd: '',
    host: 'localhost',
  },
  db_live: {
    database: 'free_ffp_new',
    user: 'free_ffp_new',
    pwd: 'v8vovo8mg%KJ2fw7',
    host: 'localhost',
  },
  jwt_secret: 'QAZxswced@123!@!',
  mail: {
    port: 465,
    host: '',
    smtp_username: '',
    smtp_password: '',
    no_eply: '',
  },
  api_version: 'v2',

  /* API Security Setting */
  is_secure_body: false,
  disable_encryption_in_os: 23,
  security: {
    aes_iv: '19Bh/jPIZ44k02rypvJG0A==',
    algoritham: 'aes-256-cbc',
    app_public_key: '-----BEGIN PUBLIC KEY-----\nMIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgG9AvLJq91wetU4ZorAo1Yz+ZyRV\nILENeT3HpmYceG6iqjUBSRn2QdteCd7toRxjzfEcWB0klSH1Kiz9SYZYBuVqfMKA\nfz8k7X4NfZxMhwqmxswv5hVT2c4CSw6U54zwIScm4i8eb/aFQPmtZwp175tZ0yOy\nmg1Wy/jHwkEp+WEfAgMBAAE=\n-----END PUBLIC KEY-----',
    app_private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIICWgIBAAKBgG9AvLJq91wetU4ZorAo1Yz+ZyRVILENeT3HpmYceG6iqjUBSRn2\nQdteCd7toRxjzfEcWB0klSH1Kiz9SYZYBuVqfMKAfz8k7X4NfZxMhwqmxswv5hVT\n2c4CSw6U54zwIScm4i8eb/aFQPmtZwp175tZ0yOymg1Wy/jHwkEp+WEfAgMBAAEC\ngYA3x0NUSOEAJL1ODPhOTgrTh/F6e9vKKTEyUlkRNREElzWzIZPfGmJmc72LMaTn\nMPrd+hILen3y6pJcwBkO7C94QuCn0e/RbnJ/CBuGfz4vcwe0BleiNGYc/i89QhYQ\nb8EJIolmDEUGrISuNzKBdPfx3NgZB464MQNKDKmERYGGUQJBAN2jTBbepneG5F1S\nrIIff1yqRLMl+rMMmeAgvIgyBsXwTEGcTkiTZ3iVhADhyPnm5ZbQmWxc2wtJzpvo\nJqQQPhMCQQCAgE+zqUPYhG3B2WPrNxv19WTk+3/Fnq4P1r3uNFP12rWwShC42s5l\nCp1M5wtrGdAS7myrvlQAWA2n/648AYJFAkBnAU+JiWygPEbBwHx/9ReB/3fyMoJy\n2DZjXZOBUI6pS2aFT5lqTWdXOVWh+00mJ1MoZkYHgJgkhObKunfK4+mVAkAfZToT\n3ysgX1qhngd3lINUWJxKBdh15AsK+6Bz7n0E+Gajp7TmNS9wKGO+QkTb6faYaYBL\nhbjoTJspjKJ5LrUxAkBWDMLfSCPR9vXWQ8KhJGuxmjRUzTEPR8ynYIHdPXab/Liu\nENXpu5ILhZaseyMBDtqUZbsCF1PJZBA+so5azA7y\n-----END RSA PRIVATE KEY-----',
    server_public_key: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCMCFg8dPHCOh9FKwfra405o+Wn\nAbSbMc8hgIR0XBrM9qnFIZbAw5MC03eYetB8RfM48Gvv1c6SWLkU3KuQsnkZ1LHc\nmiTvTNShfvOp954bQZn0JY88xPtlSxQyiivb5hzohqS9Iyyd0GjTEfcr6d2mwOAd\n9wpx7K+aIcqRD1UZDQIDAQAB\n-----END PUBLIC KEY-----',
    server_private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQCMCFg8dPHCOh9FKwfra405o+WnAbSbMc8hgIR0XBrM9qnFIZbA\nw5MC03eYetB8RfM48Gvv1c6SWLkU3KuQsnkZ1LHcmiTvTNShfvOp954bQZn0JY88\nxPtlSxQyiivb5hzohqS9Iyyd0GjTEfcr6d2mwOAd9wpx7K+aIcqRD1UZDQIDAQAB\nAoGATzfNSu5RcjJVTFjqkwj2DNymZ5M0a/OCnQ5KYFVWqAsGwcmdshEx0pB1AOLB\nnPwpe1Wvii9nPC1LDv1DZYlBrjqifcV+BlITuY7cBe/fSwr7FpfZPP6uhixYjIU+\n4bfST5+gdeIkj6D/MgKE/4hbjqAf+IzFZDUu+SOJC06ijNUCQQDs2pX1o6Dv9ibM\nEc0nL8ovaM4/CRi+a2irMfaGIszqMeUvK9OO07fNSZj3InscZnmWqRXo9d3B0hbd\nh9HgM7WvAkEAl1on7DbRLQK/GEp1sJyIK6K+bj+RDEo6Nd/W37Z0h6cZng3JMrjv\nCHe0494aB/orebNH6BcEMF4EnrUA71uIAwJABVHjjGDgfINK28qKkRbBs87m0wOh\nSqWe9DlrEBg4Agqc2zJgzhRzTGkaxnI/0aN7l6a0l0budCwD13X1gNOogQJAfuzs\nbfvKj6St/QD0kZez2mQwruRAD75v8p405IduUhSgNxv4jsDoNIGvASlRSz9RFk5z\nDv++U5GE7lN85T4tYQJAY+90dWdYVDdCppE2yJO95CR3A61bRbR39ePxr5tA/cZ8\nMAjTw89JBHpI/8nDHa72pjkQBQ/MS6eIqevAcql+EQ==\n-----END RSA PRIVATE KEY-----',
  },
  aes_secret_key(length = 20) {
    let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  },

  /* ignore auth + encrption setting */
  ignore_auth_urls: ['/v2/global-setting', '/v2/clear-cache'],
  ignore_encryption: ['/global-setting', '/v2/global-setting'],

  /* SMS Setting */
  windexsms: {
    auth_key: '3532704031323335373672',
    sender: 'BRFOTO',
  },
  bulksms: {
    username: 'ffpsms@panel',
    password: 'fDgGx5@0x316A.,',
  },

  /* File Upload Path */
  FILE_UPLOAD_PATH: process.env.FILE_UPLOAD_PATH,
  MAKE_POST_BY_USER_PHP: `${API_BASE_URL}/api/api/makePostByUserNode`,

  /* APP Constants */
  ONLY_DATE() { return commonHelper.formatDate(new Date()); },
  CURRENT_DATE() { return commonHelper.customFormatDate(new Date(), 'Y-m-d h:i:s'); },
  BEFORE_DAYS_MAKE_POST() { return commonHelper.formatDate(BEFORE_DAYS_MAKE_POST); },
  CUSTOM_FREE_USER_POST_LIMIT: '5', /* custom mate free user mate daily ni post limit */
  CUSTOM_FREE_USER_VIDEO_LIMIT: '5', /* custome free user mate daily ni video limit  */
  RATEDAILOGDAY: '3', /* rate no dailog ketla divas pachi ek var dekhadvo te day  */
  IMAGE_BASE_URL: `${API_BASE_URL}/`,
  TOTALDAYS: 4, /* upcoming festival - home page */
  POSTLIMIT: 10,
  WEBSITE: 'https://freefestivepost.com/',
  YOUTUBEURL: 'https://www.youtube.com/playlist?list=PLuulWFm02xp73hWXbTXKnuPRLAOlSX9e0',
  SALT: 'ci#$587@%weQWP',
  FREE_POST_LIMIT : 10,
};
