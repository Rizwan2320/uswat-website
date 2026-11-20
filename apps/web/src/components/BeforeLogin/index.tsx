import React from 'react'

/** The message above the sign-in form. English only, like the rest of the sign-in screen. */
const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>Sign in to manage the University of Swat website.</b>
        {' This is for university staff. If you cannot sign in, ask the central web office.'}
      </p>
    </div>
  )
}

export default BeforeLogin
