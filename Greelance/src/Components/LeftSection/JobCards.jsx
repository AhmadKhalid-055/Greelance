import "./JobCards.css";

export default function JobCards() {
  return (
    <div className="cards">
      <div className="job-card small leftCard">
        <h4>Need someone to redesign a website</h4>
        <div className="tags">
          <span>Product Design</span>
          <span>Wireframing</span>
        </div>
        <div className="tags">
          <span>Prototype</span>
          <span>Mobile App Design</span>
        </div>
        <div className="tags">
          <span>Video Making</span>
        </div>
      </div>

      <div className="job-card big">
        <div className="jobTop">
          <h2>Job Offer</h2>
          <span className="salary">$100-$200</span>
        </div>
        <p className="description">
          Need someone to redesign a website and deliver modern UI/UX design
          files with clean prototypes.
        </p>
        <div className="info">
          <div>
            <strong>Category</strong>
            <p>Product Design</p>
          </div>
          <div>
            <strong>Commitment</strong>
            <p>Contract</p>
          </div>
          <div>
            <strong>Country</strong>
            <p>United States</p>
          </div>
          <div>
            <strong>Rating</strong>
            <p>★★★★★</p>
          </div>
        </div>
        <div className="card-buttons">
          <button className="accept">Accept</button>
          <button className="decline">Decline</button>
        </div>
      </div>

      <div className="job-card small rightCard">
        <h4>United States</h4>
        <p className="stars">★★★★★</p>
        <p>Full Time</p>
        <h3>$5 Hourly</h3>
      </div>
    </div>
  );
}