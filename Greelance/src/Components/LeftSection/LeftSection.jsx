import "./LeftSection.css";

import FloatingCircles from "./FloatingCircles";
import JobCards from "./JobCards";

export default function LeftSection() {

    return (

        <div className="left">

            <FloatingCircles />

            <h1>
                Hello!
                <br />
                Future
            </h1>

            <JobCards />

            <div className="caption">

                <h2>

                    CAPTION HERE LOREM IPSUM

                </h2>

                <p>

                    Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit.

                </p>

            </div>

        </div>

    )

}