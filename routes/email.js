const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');

const User = mongoose.model('user');
const Email = mongoose.model('emails');

let mailConfig;
/* $lab:coverage:off$ */
if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'DEV') {

  mailConfig = {
    host: process.env.SMTP_ADDRESS || 'smtp.xxxxxx.com',
    port: process.env.SMTP_PORT || '25',
    secure: true, // true for 465, false for other ports 587
    // place holder once we know if theese are needed in UAT/production
    auth: {
      user: process.env.SMTP_USERNAME, // generated ethereal user
      pass: process.env.SMTP_PASSWORD // generated ethereal password
    },
    logger: true
    // include SMTP traffic and messages in the logs
  };
} else {
// PRODUCTION

  //use localhost
  if (process.env.SMTP_LOCAL === 'true' ) {

    mailConfig = {
      host: process.env.SMTP_ADDRESS || 'localhost',
      port: process.env.SMTP_PORT || '25',
      tls: {
        rejectUnauthorized: false
      }
    };
  } else {
// use SECURE and non-localhost
  mailConfig = {
    host: process.env.SMTP_ADDRESS || 'localhost',
    port: process.env.SMTP_PORT || '25',
    secure: true, // true for 465, false for other ports 587
    auth: {
      user: process.env.SMTP_USERNAME, // generated ethereal user
      pass: process.env.SMTP_PASSWORD // generated ethereal password
    }
  };
  }
}

const transporter = nodemailer.createTransport(mailConfig);

const onboardTemplate = {
  subject: 'Vahvista Laturilla.fi tilisi',
  from: 'noreply@laturilla.fi',
  bodyHtml: `<p>Laturilla.fi käyttäjätili on luotu käyttäjätunnukselle: {{username}}</p>

<p>Paina alla olevaa linkkiä vahvistaaksesi sähköpostiosoitteesi, jotta voit käyttää laturilla.fi palvelua:</p>
<p><a href="{{link}}">Vahvista</a></p>
<p> Osoite on voimassa 24h ajan </p>

<p> Tai kopioi alla oleva osoite selaimesi osoitepalkkiin:</p>
<p>{{link}}</p>
<br>
<p>Terveisin</p>
<p>Laturilla.fi teami</p>`,
  bodyPlainText: `Laturilla.fi käyttäjätili luotu käyttäjätunnukselle: {{username}}.

  Paina alla olevaa linkkiä vahvistaaksesi sähköpostiosoitteesi, jotta voit käyttää laturilla.fi palvelua:
  {{link}}
  osoite on voimassa 24h ajan

Terveisin
Laturilla.fi teami`,
  images: []
};

const forgotPasswordTemplate = {
  subject: 'Vaihda uusi salasana Laturilla.fi palveluun',
  from: 'noreply@laturilla.fi',
  bodyHtml: `<p>Vaihda Laturilla.fi tilisi ({{username}}) salasana.</p>
  <br>
<p>Paina allaolevaa linkkia vaihtaaksesi salasanasi.</p>
<p><a href="{{link}}">Vaihda salasana</a></p>

<p> Tai kopioi alla oleva osoite selaimesi osoitepalkkiin:</p>
<p>{{link}}</p>
<p> Linkki on voimassa 24h ajan </p>
<p>Jos et ole pyytänyt salasanan vaihtoa, voit jättää tämän viestin huomioimatta.</p>
<br>
<p>Terveisin,</p>
<p>Laturilla.fi teami</p>`,
  bodyPlainText: `Laturilla.fi tilisi ({{username}}) salasana on pyydetty vaihtamaan.

Paina allaolevaa linkkia vaihtaaksesi salasanasi.
{{link}}
Linkki on voimassa 24h ajan
Jos et ole pyytänyt salasanan vaihtoa, voit jättää tämän viestin huomioimatta.
  
Terveisin
Laturilla.fi teami`,
  images: []
};


const replyTemplate = {
  subject: 'Olet sanut uuden viestin',
  from: 'noreply@laturilla.fi',
  bodyHtml: `<p>{{username}} on lähettänyt sinne uuden viestin:</p>
<p>{{message}}</p>
<br/>
<p>Voit tarkastella ja vastata viesteihin <a href="{{link}}">{{link}}</a> sivulta</p>
<p>Jos et halua vastaanottaa sähköposteja, voit peruuttaa ne <a href="https://laturilla.fi/me">asetuksista</a> </p
<p>Terveisin</p>
<p>Laturilla.fi teami</p>`,
  bodyPlainText: `{{username}} on lähettänyt sinne uuden viestin:

{{message}}

Voit vastata käyttäjälle {{link}} sivulta

Terveisin
Laturilla.fi teami`,
  images: []
};

const FeedbackTemplate = {
  subject: 'Palautetta Laturilla.fi',
  from: 'noreply@laturilla.fi',
  bodyHtml: `<p>{{username}} on lähettänyt sinne palautetta:</p>
<p>{{message}}</p>

<br/>
<p>Terveisin</p>
<p>Laturilla.fi teami</p>`,
  bodyPlainText: `{{username}} on lähettänyt sinne uuden viestin:

{{message}}

Terveisin
Laturilla.fi teami`,
  images: []
};

module.exports = (app) => {

    app.get(`/api/email/:uuid`, async (req, res) => {
      
      const { uuid } = req.params;
      let emailInfo = await Email.findOne({uuid}).select("-__v").select("-_id").select("-createdAt").select("-email");

      if(emailInfo) {
        return res.status(200).send(emailInfo);
      }
      return res.status(404).json({ message: "does not Exists" });

    });

    app.post(`/api/email/reset`, async (req, res) => {

      const { email } = req.body;

      const uuid = uuidv4();
      const emailTemplate = forgotPasswordTemplate;
      const base = process.env.BASE_URL || 'https://laturilla.fi'

      const link = `${base}/changepw/${uuid}`;

      let subject = emailTemplate.subject.replace(/{{username}}/g, email);
      let text = emailTemplate.bodyPlainText.replace(/{{username}}/g, email);
      let html = emailTemplate.bodyHtml.replace(/{{username}}/g, email);

      text = text.replace(/{{link}}/g, link);
      html = html.replace(/{{link}}/g, link);

      const mailOptions = {
        from: emailTemplate.from,
        to: email,
        subject,
        text,
        html
      };

    try {

      const user = await User.findOne({email: email});

      if (user) {
        //make not to await, so it won't block
        transporter.sendMail(mailOptions);

        //Save the email for 24hours and the delete
        const emailRequest = {
          uuid,
          email,
          type: 'RESET',
          createdAt: new Date()
        }

        let update = emailRequest;
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        const status = await Email.findOneAndUpdate({email: email}, update, options);

        return res.status(201).send({message: "Viesti lähetetty jos käyttäjä löytyy järjestelmästä"});
      }
      //if no user found on system, don't send anything, and just return the same message
      return res.status(201).send({message: "Viesti lähetetty jos käyttäjä löytyy järjestelmästä"});

    } catch (err) {
      console.log('could not create email reset/onboard message');
      console.log(err);
      return res.status(403).send({ message: 'could not create email reset/onboard message' })
    }
  });

  app.post(`/api/email/onboard`, async (req, res) => {

    const { email } = req.body;

    const uuid = uuidv4();
    const emailTemplate = onboardTemplate;
    const base = process.env.BASE_URL || 'https://laturilla.fi'
    const link = `${base}/confirm/${uuid}`;

    let subject = emailTemplate.subject.replace(/{{username}}/g, email);
    let text = emailTemplate.bodyPlainText.replace(/{{username}}/g, email);
    let html = emailTemplate.bodyHtml.replace(/{{username}}/g, email);

    text = text.replace(/{{link}}/g, link);
    html = html.replace(/{{link}}/g, link);

    const mailOptions = {
      from: emailTemplate.from,
      to: email,
      subject,
      text,
      html
    };

  try {

    const user = await User.findOne({email: email});

    if (user) {

      //make not to await, so it won't block
      transporter.sendMail(mailOptions);

      //Save the email for 24hours and the delete
      const emailRequest = {
        uuid,
        email,
        type: 'ONBOARD',
        createdAt: new Date()
      }

      let update = emailRequest;
      let options = {upsert: true, new: true, setDefaultsOnInsert: true};
      //do not update if user is not found on system
      const status = await Email.findOneAndUpdate({email: email}, update, options);

      return res.status(201).send({message: "Viesti lähetetty jos käyttäjä löytyy järjestelmästä"});
    }
    //if no user found on system, don't send anything, and just return the same message
    console.log('user not found, not sending anything');
    return res.status(201).send({message: "Viesti lähetetty jos käyttäjä löytyy järjestelmästä"});

  } catch (err) {
    console.log('could not create email reset/onboard message');
    console.log(err);
    return res.status(403).send({
      error: true,
      message: 'could not create email reset/onboard message'
    })
  }
});

app.post(`/api/email/feedback`, async (req, res) => {

  const {email, message} = req.body;

  const emailTemplate = FeedbackTemplate;
  const base = process.env.BASE_URL || 'https://laturilla.fi'

  let subject = emailTemplate.subject.replace(/{{username}}/g, email);
  let text = emailTemplate.bodyPlainText.replace(/{{username}}/g, email);
  let html = emailTemplate.bodyHtml.replace(/{{username}}/g, email);


  //fix the CR in message
  const new_line = '<br/>';
  const msg = message.replace(/\n/g, new_line);

  text = text.replace(/{{message}}/g, msg);
  html = html.replace(/{{message}}/g, msg);

  const mailOptions = {
    from: emailTemplate.from,
    to: process.env.FEEDBACK_RECIPIENT_EMAIL || 'laturilla@hirsikangas.fi',
    subject,
    text,
    html
  };

    console.log(`user ${email} send feedback: ${new Date().toISOString()} : ${message} ` );
    //make not to await, so it won't block
    transporter.sendMail(mailOptions);

    return res.status(201).send({message: "email send"});

});

app.post(`/api/email/sendreply`, async (req, res) => {

  const {fromUser, message, to, anom} = req.body;   

  const emailTemplate = replyTemplate;
  const base = process.env.BASE_URL || 'https://laturilla.fi'
  const link = `${base}/messages`;

  let subject = emailTemplate.subject.replace(/{{username}}/g, fromUser);
  let text = emailTemplate.bodyPlainText.replace(/{{username}}/g, fromUser);
  let html = emailTemplate.bodyHtml.replace(/{{username}}/g, fromUser);

  //fix the CR in message
  const new_line = '<br/>';
  const msg = message.replace(/\n/g, new_line);

  text = text.replace(/{{message}}/g, msg);
  html = html.replace(/{{message}}/g, msg);

  text = text.replace(/{{link}}/g, link);
  html = html.replace(/{{link}}/g, link);

  const mailOptions = {
    from: emailTemplate.from,
    to: to,
    subject,
    text,
    html
  };

    //make not to await, so it won't block
    transporter.sendMail(mailOptions);

    return res.status(201).send({message: "email send"});

});

}
