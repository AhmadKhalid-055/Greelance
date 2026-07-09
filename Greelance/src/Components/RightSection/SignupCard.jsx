import "./SignupCard.css";

import Button from "../Button/Button";
import SocialIcons from "./SocialIcons";

export default function SignupCard() {

    return (

        <div className="signupCard">

            <h1 className="logo">

                <span className="green">
                    GREE
                </span>

                LANCE

            </h1>

            <p className="welcome">

                Thanks for your interest in Greelance!

                <br />

                Before we get started,

                how do you want to sign up?

            </p>

            <Button title="Freelancer" />

            <Button title="Employer" />

            <Button title="Agency" />

            <Button title="Service Provider" />

            <button className="nextButton">

                Next

            </button>

            <p className="signin">

                Already have an account?

                <span>

                    Sign In

                </span>

            </p>

            <p className="socialText">

                You can also sign in with

            </p>

            <SocialIcons />

        </div>

    )

}