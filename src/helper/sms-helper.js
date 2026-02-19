const axios = require('axios');
const FormData = require('form-data');
const db = require('../config/database');
const config = require('../config/config');
const queryHelper = require('./query-helper');
const commonHelper = require('./common-helper');

const API_BASE_URL = process?.env?.API_BASE_URL;

var sms_helper = {
  async send_email(email, tamp_name, var1, var2, var3) {
    const requestOptions = {
      method: 'POST',
      url: 'https://control.msg91.com/api/v5/email/send',
      headers: {
        accept: 'application/json',
        authkey: '394115Am2eyNc3i642e5bdcP1',
        'content-type': 'application/json',
      },
      data: {
        to: [
          {
            name: var1,
            email,
          },
        ],
        from: {
          name: 'BrandFotos Support',
          email: 'support@brandfotos.com',
        },
        domain: 'mail.brandfotos.com',
        in_reply_to: 'support@brandfotos.com',
        reply_to: [
          {
            email: 'support@brandfotos.com',
          },
        ],
        template_id: tamp_name,
        variables: {
          VAR1: var1,
          VAR2: var2,
          VAR3: var3,
        },
      },
    };

    axios(requestOptions).then((response) => {
      // Do something with the response
    });
  },

  async gateway_type() {
    const where = { option_name: 'sms_gateway_type' };
    const foSetting = await db.query(
      queryHelper.select('value', 'setting', where, 'id desc', 1),
    );
    if (foSetting.length > 0) {
      return foSetting[0].value;
    }
    return 'bulksms';
  },

  async bulk_sms(mobile, message, template_id) {
    const { username } = config.bulksms;
    const { password } = config.bulksms;
    const sender = 'BRFOTO';
    const url = `http://api.bulksmsgateway.in/sendmessage.php?user=${
      encodeURIComponent(username)
    }&password=${
      encodeURIComponent(password)
    }\
        &mobile=${
  encodeURIComponent(mobile)
}&sender=${
  encodeURIComponent(sender)
}&message=${
  encodeURIComponent(message)
}\
        &type=${
  encodeURIComponent('3')
}&template_id=${
  encodeURIComponent(template_id)}`;
    // console.log(url);
    const res = await axios.get(url);
    console.log(res.data);
  },

  async windexsms(country_code, mobile, message, template_id) {
    const data = new FormData();
    data.append('authkey', config.windexsms.auth_key);
    data.append('mobiles', mobile);
    data.append('message', message);
    data.append('sender', config.windexsms.sender);
    data.append('route', 2);
    data.append('country', country_code);
    data.append('DLT_TE_ID', template_id);
    const res = await axios.post(
      'http://mylogin.windexsms.com/api/sendhttp.php',
      data,
    );
    // console.log(country_code+mobile+' : '+res.data);
  },

  async msg91otp(mobile, template_id, otp, sshcode) {
    const data = {
      OTP: otp,
      var: sshcode,
    };
    try {
      const res = await axios.post(
        `https://control.msg91.com/api/v5/otp?template_id=${
          template_id
        }&mobile=${
          mobile}`,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            authkey: '394115Am2eyNc3i642e5bdcP1',
          },
        },
      );
      console.log('SMS Provider Response', res);
    } catch (err) {
      const error = 'Something error on send sms with '
        + `https://control.msg91.com/api/v5/otp?template_id=${
          template_id
        }&mobile=${
          mobile}`;
      console.error(`Error Details : ${err}`);
      // var fileCache = await fs.appendFile("./cache/err.txt", JSON.stringify({ 'mobile':mobile,'api':'msg91-otp','error':err,'created_at':commonHelper.customFormatDate(new Date(),'Y-m-d h:i:s') }));
      await db.query(
        queryHelper.insert('sms_error_log', {
          mobile,
          api: 'msg91-otp',
          error: err,
          created_at: commonHelper.customFormatDate(new Date(), 'Y-m-d h:i:s'),
        }),
      );
    }
    return true;
  },

  async msg91sms(mobile, template_id, var1, var2, var3) {
    const sender = 'BRFOTO';
    const data = {
      template_id,
      sender,
      short_url: '0',
      mobiles: mobile,
      var1,
      var2,
      var3,
    };
    try {
      /* console.log(data); */
      const res = await axios.post(
        'https://control.msg91.com/api/v5/flow/',
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            authkey: '394115Am2eyNc3i642e5bdcP1',
          },
        },
      );
      console.log('SMS Provider Response', res);
    } catch (err) {
      console.error('Something error on send sms with data', data);
      console.error(`Error Details : ${err}`);
      const error = `Template id : ${template_id}`;
      // var fileCache = await fs.appendFile("./cache/err.txt", JSON.stringify({ 'mobile':mobile,'api':'msg91-sms','error':err,'created_at':commonHelper.customFormatDate(new Date(),'Y-m-d h:i:s') }));
      await db.query(
        queryHelper.insert('sms_error_log', {
          mobile,
          api: 'msg91-sms',
          error,
          created_at: commonHelper.customFormatDate(new Date(), 'Y-m-d h:i:s'),
        }),
      );
    }
    return true;
  },

  async send_otp_sms(mobile, otp, page, country_code, ssh_code) {
    if (page == 'forgotpassword') {
      const where = { mobile };
      const foUserDetails = await db.query(
        queryHelper.select(
          'business_name,expdate,b_email',
          'admin',
          where,
          'id desc',
          1,
        ),
      );
      if (foUserDetails.length == 0) {
        return;
      }
      const { b_email } = foUserDetails[0];
      const email_tamp_name = 'ForgotPasswordOtp1';
      const email_var1 = otp;
      const email_var2 = '';
      const email_var3 = '';

      if (b_email != '') {
        const formData = new FormData();
        formData.append(
          'mytoken',
          'mVfHmPbTudbqJBWMiqoAPA91bH6gSTssOVJwlpJeuIVwdSbZGFUd4b7HoNZ5FyaNN4LVLbdmffp9',
        );
        formData.append('email', b_email);
        formData.append('tamp_type', email_tamp_name);
        formData.append('var1', email_var1);
        formData.append('var2', email_var2);
        formData.append('var3', email_var3);
        try {
          const abc = await axios.post(
            `${API_BASE_URL}/api/nodeSideEmailSend`,
            formData,
          );
          console.log(abc);
        } catch (error) {
          console.error('Forgot password email API error:', error.message);
        }
      }
    }

    let DLT_TE_ID = '';
    let message = '';
    let msg91_tamp_id = '643a93fdd6fc05019a28d362';
    /* BRAND FOTOS */
    switch (page) {
      case 'signup':
        message = `# ${
          otp
        } is OTP for your BRANDFOTOS for Register OTP valid for 2 minutes. - BRANDFOTOS \n ${
          ssh_code}`;
        DLT_TE_ID = '1207168147888232182';
        msg91_tamp_id = '643a93fdd6fc05019a28d362';
        break;
      case 'forgotpassword':
        message = `# ${
          otp
        } is OTP for your BRANDFOTOS for Forgot Password OTP valid for 2 minutes. - BRANDFOTOS \n ${
          ssh_code}`;
        DLT_TE_ID = '1207167772862010277';
        msg91_tamp_id = '642fa6d3d6fc05492c38c074';
        break;
      case 'admin_login_otp':
        message = `# ${
          otp
        } is OTP for your BRANDFOTOS for Register OTP valid for 2 minutes. - BRANDFOTOS \n${
          ssh_code}`;
        DLT_TE_ID = '1207168147888232182';
        msg91_tamp_id = '643a93fdd6fc05019a28d362';
        break;
    }
    /* FFP APP */

    const sms_gateway_type = await sms_helper.gateway_type();
    if (sms_gateway_type == 'bulksms') {
      await sms_helper.bulk_sms(mobile, message, DLT_TE_ID);
    }
    if (sms_gateway_type == 'windex') {
      await sms_helper.windexsms(country_code, mobile, message, DLT_TE_ID);
    }
    if (sms_gateway_type == 'msg91') {
      /* await sms_helper.msg91otp("91"+mobile,msg91_tamp_id,otp,ssh_code); */

      const formData1 = new FormData();
      formData1.append(
        'mytoken',
        'mVfHmPbTudbqJBWMiqoAPA91bH6gSTssOVJwlpJeuIVwdSbZGFUd4b7HoNZ5FyaNN4LVLbdmffp9',
      );
      formData1.append('mobile', `91${mobile}`);
      formData1.append('msg91_tamp_id', msg91_tamp_id);
      formData1.append('otp', otp);
      formData1.append('sshcode', ssh_code);
      formData1.append('sms_type', 'otp');
      formData1.append('var1', '');
      formData1.append('var2', '');
      formData1.append('var3', '');

      try {
        const abc = await axios.post(
          `${API_BASE_URL}/api/nodeSideSMSSend`,
          formData1,
        );
        console.log(abc);
      } catch (error) {
        console.error('OTP SMS API error:', error.message);
      }
    }
  },

  async send_other_sms(mobile, page, term) {
    const where = { mobile };
    const foUserDetails = await db.query(
      queryHelper.select(
        'name,business_name,expdate,b_email',
        'admin',
        where,
        'id desc',
        1,
      ),
    );
    if (foUserDetails.length == 0) {
      return;
    }
    const { b_email } = foUserDetails[0];
    const userName = (foUserDetails[0].business_name!="")?foUserDetails[0].business_name:"User";

    const activated = config.ONLY_DATE();
    const expired = foUserDetails[0].expdate != ''
      && foUserDetails[0].expdate != '0000-00-00'
      ? commonHelper.formatDate(foUserDetails[0].expdate)
      : '';
    term += ' Month';
    let DLT_TE_ID = '';
    let message = '';
    let msg91_tamp_id = '';
    let var1 = '';
    let var2 = '';
    let var3 = '';
    const youtubelink = 'http://m.9m.io/gysbzwh';

    let email_tamp_name = '';
    const email_var1 = userName;
    let email_var2 = '';
    let email_var3 = '';

    let whatsAppTempName = '';
    /* FFP APP */
    /* BrandFotos */
    switch (page) {
      case 'thanks':
        message = 'Thank you so much for sharing your experience with us. We hope to see you again soon. - BRANDFOTOS TEAM';
        DLT_TE_ID = '1207167772869621156';
        msg91_tamp_id = '6433ab65d6fc0504996d7064';
        email_tamp_name = 'Thankyouforfeedback';
        whatsAppTempName = 'review_thank_you';
        break;
      case 'planexpired':
        message = `Hello, ${
          userName
        }! Your BRANDFOTOS plan has expired, please renew now. Thank you - BRANDFOTOS TEAM`;
        DLT_TE_ID = '1207167772881254683';
        msg91_tamp_id = '6433abe2d6fc0552c92d1dc2';
        var1 = userName;

        email_tamp_name = 'Subscriptionexpiredemail';
        whatsAppTempName = 'plan_expired_renew';
        break;
      case 'welcome':
        message = `Welcome to BRAND FOTOS! We're thrilled to have you on board. Click here to know how to use Brand Fotos. ${
          youtubelink}`;
        DLT_TE_ID = '1207168239890783241';

        msg91_tamp_id = '6464a401d6fc0532ae5038e2';
        var1 = youtubelink;

        email_tamp_name = 'AfterRegister';
        /* whatsAppTempName = "register_after_welcome"; */
        whatsAppTempName = 'welcome_message_with_catalogue';
        break;
      case 'buy':
        message = `Thank you for your subscription on BRANDFOTOS, now your plan is activated. \n Plan term:${
          term
        }, \n Activated:${
          activated
        }, \n Expired:${
          expired
        }`;
        DLT_TE_ID = '1207167772877783794';
        msg91_tamp_id = '6433abc7d6fc0519a7397a52';
        var1 = term;
        var2 = activated;
        var3 = expired;

        email_tamp_name = 'AfterSubscriptionPurchase';
        whatsAppTempName = 'subscription_buy_done_notification';
        break;
      case 'expiredafter':
        message = `Hello, ${
          userName
        }, your BRANDFOTOS plan will be due for renewal on ${
          expired
        }. You may renew your plan by visiting the app.`;
        DLT_TE_ID = '1207167772886315871';
        msg91_tamp_id = '6433ac11d6fc051b79721202';
        var1 = userName;
        var2 = expired;

        email_tamp_name = 'Before2DaysofSubscripExpired';
        whatsAppTempName = 'plan_expire_soon_notification';
        break;
      case 'trial':
        message = `Hello, ${
          userName
        }, your BRANDFOTOS Trial has expired. You may renew your plan by visiting the app. - BRANDFOTOS TEAM`;
        DLT_TE_ID = '1207167772890622796';
        msg91_tamp_id = '6433ac30d6fc053a7c3b3a93';
        var1 = userName;

        email_tamp_name = 'PromoCodeExpireTime';
        email_var2 = '';
        email_var3 = '';
        whatsAppTempName = 'trial_expired_renew';
        break;
    }
    /* php api whatsapp msg api call start */
    try {
      const formDataWP = new FormData();
      formDataWP.append(
        'mytoken',
        'mVfHmPbTudbqJBWMiqoAPA91bH6gSTssOVJwlpJeuIVwdSbZGFUd4b7HoNZ5FyaNN4LVLbdmffp9',
      );
      formDataWP.append('mobile', mobile);
      formDataWP.append('tempname', whatsAppTempName);
      formDataWP.append('userName', userName);
      formDataWP.append('expired', expired);
      formDataWP.append('term', term);

      const WhatLog = await axios.post(
        `${API_BASE_URL}/api/nodeSideWhatsAppSMS`,
        formDataWP,
      );
      console.log(WhatLog);
    } catch (error) {
      console.error('WhatsApp API error:', error.message);
    }
    /* php api whatsapp msg api call end */

    const sms_gateway_type = await sms_helper.gateway_type();
    /* sms_gateway_type = "msg91"; */
    if (sms_gateway_type == 'bulksms') {
      await sms_helper.bulk_sms(mobile, message, DLT_TE_ID);
    }
    if (sms_gateway_type == 'windex') {
      await sms_helper.windexsms('91', mobile, message, DLT_TE_ID);
    }
    if (sms_gateway_type == 'msg91') {
      // await sms_helper.msg91sms("91"+mobile,msg91_tamp_id,var1,var2,var3);

      const formData1 = new FormData();
      formData1.append(
        'mytoken',
        'mVfHmPbTudbqJBWMiqoAPA91bH6gSTssOVJwlpJeuIVwdSbZGFUd4b7HoNZ5FyaNN4LVLbdmffp9',
      );
      formData1.append('mobile', `91${mobile}`);
      formData1.append('msg91_tamp_id', msg91_tamp_id);
      formData1.append('otp', '');
      formData1.append('sshcode', '');
      formData1.append('sms_type', 'sms');
      formData1.append('var1', var1);
      formData1.append('var2', var2);
      formData1.append('var3', var3);

      try {
        const abc = await axios.post(
          `${API_BASE_URL}/api/nodeSideSMSSend`,
          formData1,
        );
        console.log(abc);
      } catch (error) {
        console.error('SMS API error:', error.message);
      }
    }

    if (b_email != '' && email_tamp_name != '') {
      // await sms_helper.send_email(b_email,email_tamp_name,email_var1,email_var2,email_var3);

      const formData = new FormData();
      formData.append(
        'mytoken',
        'mVfHmPbTudbqJBWMiqoAPA91bH6gSTssOVJwlpJeuIVwdSbZGFUd4b7HoNZ5FyaNN4LVLbdmffp9',
      );
      formData.append('email', b_email);
      formData.append('tamp_type', email_tamp_name);
      formData.append('var1', email_var1);
      formData.append('var2', email_var2);
      formData.append('var3', email_var3);

      try {
        const abc = await axios.post(
          `${API_BASE_URL}/api/nodeSideEmailSend`,
          formData,
        );
        console.log(abc);
      } catch (error) {
        console.error('Email API error:', error.message);
      }
    }
  },
};
exports.sms = sms_helper;
