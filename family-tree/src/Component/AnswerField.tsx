import { useState } from "react";

export default function AnswerField(props: {
  question: string;
  onSubmit: (ans: { relation: string; a: string; b: string }) => void;
  onFinish: () => void;
}) {
  const [relation, setRelation] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  return (
    <div>
      <h3>Answer</h3>
      <div style={{ marginBottom: 8 }}>
        Question: <b>{props.question}</b>
      </div>

      <input placeholder="relation" value={relation} onChange={(e) => setRelation(e.target.value)} />
      <input placeholder="a" value={a} onChange={(e) => setA(e.target.value)} />
      <input placeholder="b" value={b} onChange={(e) => setB(e.target.value)} />

      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => {
            if (!relation.trim() || !a.trim() || !b.trim()) return alert("relation/a/b 都要填");
            props.onSubmit({ relation: relation.trim(), a: a.trim(), b: b.trim() });
            setRelation("");
            setA("");
            setB("");
          }}
        >
          Submit
        </button>

        <button onClick={props.onFinish} style={{ marginLeft: 8 }}>
          Finish (test)
        </button>
      </div>
    </div>
  );
}
