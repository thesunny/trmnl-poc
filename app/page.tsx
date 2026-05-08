import { SceneCanvas } from "./SceneCanvas";
import { WIDTH, HEIGHT } from "./scene";

export default function Home() {
  return (
    <main
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <section>
        <h2 style={{ margin: "0 0 8px" }}>Source canvas (full color)</h2>
        <SceneCanvas />
      </section>
      <section>
        <h2 style={{ margin: "0 0 8px" }}>
          Quantized 2-bit grayscale PNG (/image.png)
        </h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image.png"
          width={WIDTH}
          height={HEIGHT}
          alt="Planet and Moon (2-bit grayscale)"
          style={{ display: "block", border: "1px solid #ccc" }}
        />
      </section>
    </main>
  );
}
