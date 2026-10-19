import { Composition, Folder, Still } from "remotion";
import { MyComposition } from "./Composition";
import { ChapterScene } from "./reflejos/ChapterScene";
import { IntroScene } from "./reflejos/IntroScene";
import { OutroScene } from "./reflejos/OutroScene";
import { ReflexScene } from "./reflejos/ReflexScene";
import { Reflejos } from "./reflejos/Reflejos";
import { Thumbnail } from "./reflejos/Thumbnail";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="Reflejos"
        component={Reflejos}
        durationInFrames={35347}
        fps={30}
        width={1920}
        height={1080}
      />
      <Still
        id="Miniatura"
        component={Thumbnail}
        width={1280}
        height={720}
        defaultProps={{
          image: "nela/thumb.jpg",
          line1: "Reflejos del recién nacido",
          line2: "Guía práctica",
          badge: "15 reflejos y reacciones",
        }}
      />
      <Folder name="Escenas">
        <Composition
          id="Intro"
          component={IntroScene}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            tagline: "Demostración práctica",
            title: "Reflejos del recién nacido",
            subtitle: "Reflejos primitivos y reacciones posturales",
          }}
        />
        <Composition
          id="Capitulo"
          component={ChapterScene}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            part: "01",
            title: "Reflejos primitivos",
            items: [
              "Reflejo de succión",
              "Reflejo de búsqueda",
              "Reflejo de Moro",
            ],
          }}
        />
        <Composition
          id="PanelReflejo"
          component={ReflexScene}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            section: "Reflejos primitivos",
            counter: "08 / 09",
            title: "Reflejo de Moro",
            alias: "",
            stimulus:
              "Sujetar y elevar al bebé, y simular una caída controlada.",
            response:
              "Sobresalto: extensión de brazos y ligera flexión de piernas.",
            note: "",
            stimulusAt: 1,
            responseAt: 4,
            phases: [],
            phaseAt: [],
            replayFrom: -1,
          }}
        />
        <Composition
          id="Resumen"
          component={OutroScene}
          durationInFrames={360}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            primitive: [
              "Reflejo de succión",
              "Reflejo de búsqueda",
              "Reflejo de Moro",
            ],
            postural: ["Reacción de tracción", "Reacción de Landau"],
            closing: "Gracias por ver · Comparte este video",
          }}
        />
      </Folder>
    </>
  );
};
