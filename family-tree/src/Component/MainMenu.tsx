import { useState } from "react";

type MainMenuProps = {
  onSubmit: (user: { name: string; age: number }) => void;
};

export default function MainMenu({ onSubmit }: MainMenuProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");

  const handleSubmit = () => {
    if (!name || age === "") return;

    onSubmit({
      name,
      age: Number(age),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        placeholder="名字"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="年齡"
        value={age}
        onChange={(e) =>
          setAge(e.target.value === "" ? "" : Number(e.target.value))
        }
      />

      <button onClick={handleSubmit}>送出</button>
    </div>
  );
}
