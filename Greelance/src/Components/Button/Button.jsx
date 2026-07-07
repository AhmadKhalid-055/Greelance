import "./Button.css";

export default function Button({ title }) {
  return (
    <button className="customButton" type="button">
      {title}
    </button>
  );
}