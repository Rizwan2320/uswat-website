import React from 'react'

import './index.scss'

/**
 * The message above the sign-in form (slice 3al). Plain words about who may sign in, where the
 * account comes from and what to do about a forgotten password, in English and Urdu, since a person
 * who is not signed in has not chosen a language yet. The Urdu lines are drafts for a native reader.
 * While no mail is set up the "Forgot your password?" link would lead nowhere, so it is hidden in
 * index.scss and the text says what to do instead; show it again when mail is set up.
 */
const BeforeLogin: React.FC = () => {
  return (
    <div className="before-login">
      <p className="before-login__title">
        <b>Staff sign-in: University of Swat website</b>
      </p>
      <ul className="before-login__list">
        <li>
          Use the email and password given to you by the web office, or by your head of department.
          There is no self sign-up.
        </li>
        <li>
          Once you are in, the bar at the top says who you are and what you can do: Platform Admin,
          head of a department, programme coordinator, editor.
        </li>
        <li>
          Forgotten your password? Reset by email is not set up yet. Ask the person who made your
          account to set a new one.
        </li>
      </ul>
      <div className="before-login__ur" dir="rtl" lang="ur">
        <p>
          <b>عملے کا سائن اِن: جامعہ سوات کی ویب سائٹ</b>
        </p>
        <p>
          ویب آفس یا اپنے شعبے کے سربراہ کی دی ہوئی ای میل اور پاس ورڈ استعمال کریں۔ خود اکاؤنٹ نہیں
          بنایا جا سکتا۔ اندر آنے پر اوپر کی پٹی بتاتی ہے کہ آپ کون ہیں اور کیا کر سکتے ہیں۔ پاس
          ورڈ بھول گئے ہوں تو ای میل سے ری سیٹ ابھی دستیاب نہیں؛ جس نے آپ کا اکاؤنٹ بنایا اس سے نیا
          پاس ورڈ لگوائیں۔
        </p>
      </div>
    </div>
  )
}

export default BeforeLogin
