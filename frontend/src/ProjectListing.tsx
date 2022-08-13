import React, {
  useEffect, useState,
} from 'react';
import { MeshDistortMaterial } from '@react-three/drei';
import { GroupProps } from '@react-three/fiber';
import { animated, useSpring, config } from '@react-spring/three';
import {
  Color,
  DoubleSide,
} from 'three';
// @ts-ignore
import { Project } from '../generatedSanitySchemaTypes';
import { ThreeButton } from './ThreeButton';
import { ProjectEntry } from './ProjectEntry';
import rightArrowFill from './lines/rightArrowFill';
import { Scribble } from './Scribble';
import { CoordArray } from './CoordArray';
import colors from './colors';
import rightArrowLines from './lines/rightArrowLines';
import leftArrowFill from './lines/leftArrowFill';
import leftArrowLines from './lines/leftArrowLines';

export function ProjectListing({ active, projects, ...groupProps }:
  { active:boolean, projects: Project[] | null; } & GroupProps) {
  const [blobIsBig, setBlobIsBig] = useState(false);
  const [carouselIsActive, setCarouselIsActive] = useState(false);
  const [carouselHasAnimated, setCarouselHasAnimated] = useState(false);
  const [rightArrowLinesVisible, setRightArrowLinesVisible] = useState(false);
  const [leftArrowLinesVisible, setLeftArrowLinesVisible] = useState(false);
  const [rightArrowFillVisible, setRightArrowFillVisible] = useState(false);
  const [leftArrowFillVisible, setLeftArrowFillVisible] = useState(false);

  const { blobScale, blobPosition } = useSpring({
    blobPosition: blobIsBig ? [0, 0, 0] : [3.62, 1.91, 0],
    blobScale: blobIsBig ? 1 : 0,
    config: config.wobbly,
  });
  const [nTurns, setNTurns] = useState(0);

  const nProjects = projects?.length ?? 0;
  const arcPerProject = projects ? ((Math.PI * 2) / nProjects) : 0;
  const { carouselRotation, carouselScale } = useSpring({
    carouselRotation: carouselIsActive ? [0, nTurns * -arcPerProject, 0] : [0, -1 * Math.PI, 0],
    carouselScale: carouselIsActive ? 1 : 0,
    config: config.gentle,
  });

  const activeIndex = (nTurns
    + (nTurns < 0 ? nProjects * Math.ceil(-nTurns / nProjects) : 0)) % nProjects;

  useEffect(() => {
    if (active) {
      let delay = 0;
      setNTurns(0);
      setTimeout(() => {
        setBlobIsBig(true);
      }, delay += 500);
      setTimeout(() => {
        setCarouselIsActive(true);
      }, delay += 500);
      setTimeout(() => {
        setCarouselHasAnimated(true);
      }, delay += 1000);
      setTimeout(() => {
        setLeftArrowFillVisible(true);
      }, delay -= 300);
      setTimeout(() => {
        setRightArrowFillVisible(true);
      }, delay += 100);
      setTimeout(() => {
        setLeftArrowLinesVisible(true);
      }, delay += 500);
      setTimeout(() => {
        setRightArrowLinesVisible(true);
      }, delay += 100);
    } else {
      setTimeout(() => {
        setCarouselIsActive(false);
        setBlobIsBig(false);
        setCarouselHasAnimated(false);
        setLeftArrowLinesVisible(false);
        setRightArrowLinesVisible(false);
        setLeftArrowFillVisible(false);
        setRightArrowFillVisible(false);
        setNTurns(0);
      }, 500);
    }
  }, [active]);

  const [rightArrowHovering, setRightArrowHovering] = useState(false);
  const [leftArrowHovering, setLeftArrowHovering] = useState(false);
  const { rightArrowScale, leftArrowScale } = useSpring({
    rightArrowScale: rightArrowHovering ? 1.2 : 1,
    leftArrowScale: leftArrowHovering ? 1.2 : 1,
    config: config.wobbly,
  });

  return (
    <group {...groupProps}>
      <animated.mesh
        scale={blobScale}
        // @ts-ignore
        position={blobPosition}
      >
        <sphereBufferGeometry
          args={[3.5, 70, 70]}
          attach="geometry"
        />
        <MeshDistortMaterial
          color="#551F00"
          speed={6}
          radius={1}
          distort={0.3}
          depthTest={false}
          transparent
          opacity={0.7}
          side={DoubleSide}
        />
        {/* <meshBasicMaterial color={0xfff1ef} attach="material" /> */}
      </animated.mesh>
      <animated.group
        // @ts-ignore
        rotation={carouselRotation}
        scale={carouselScale}
      >
        {projects && projects.map((project, index) => (
          <group
            rotation={[0, index * arcPerProject, 0]}
            key={project._id + index.toString()}
          >
            <ProjectEntry
              project={project}
              active={carouselHasAnimated && index === activeIndex}
            />
          </group>
        ))}

      </animated.group>
      <animated.group
        position={[-0.6, -1, 3.5]}
        scale={leftArrowScale}
      >
        <Scribble
          points={(leftArrowFill as CoordArray[])}
          size={0.7}
          position={[-0.02, -0.07, -0.1]}
          lineWidth={0.15}
          color={new Color(colors.lime)}
          rotation={[Math.PI, 0, 0]}
          visible={leftArrowFillVisible}
          drawSpringConfig={config.slow}
          scaleSpringConfig={config.wobbly}
          curved
          // closed
          nPointsInCurve={500}
        />
        <Scribble
          points={(leftArrowLines as CoordArray[])}
          size={0.5}
          position={[0, 0, 0.1]}
          lineWidth={0.01}
          color={new Color(colors.black)}
          rotation={[Math.PI, 0, 0]}
          visible={leftArrowLinesVisible}
          drawSpringConfig={config.slow}
          scaleSpringConfig={config.wobbly}
          curved
          nPointsInCurve={500}
        />
        {leftArrowFillVisible && (
          <ThreeButton
            position={[0, 0, 0]}
            width={1}
            height={0.5}
            description=""
            activationMsg=""
            onFocus={() => { setLeftArrowHovering(true); }}
            onBlur={() => { setLeftArrowHovering(false); }}
            cursor="previous"
            onClick={() => setNTurns((n) => n - 1)}
          />
        )}
      </animated.group>
      <animated.group
        position={[0.6, -1, 3.5]}
        scale={rightArrowScale}
      >
        <Scribble
          points={(rightArrowFill as CoordArray[])}
          size={0.7}
          position={[0.02, -0.07, -0.1]}
          lineWidth={0.15}
          color={new Color(colors.lime)}
          rotation={[Math.PI, 0, 0]}
          visible={rightArrowFillVisible}
          drawSpringConfig={config.slow}
          scaleSpringConfig={config.wobbly}
          curved
          // closed
          nPointsInCurve={500}
        />
        <Scribble
          points={(rightArrowLines as CoordArray[])}
          size={0.5}
          position={[0, 0, 0.1]}
          lineWidth={0.01}
          color={new Color(colors.black)}
          rotation={[Math.PI, 0, 0]}
          visible={rightArrowLinesVisible}
          drawSpringConfig={config.slow}
          scaleSpringConfig={config.wobbly}
          curved
          nPointsInCurve={500}
        />
        {rightArrowFillVisible && (
          <ThreeButton
            position={[0, 0, 0]}
            width={1}
            height={0.5}
            description=""
            activationMsg=""
            onFocus={() => { setRightArrowHovering(true); }}
            onBlur={() => { setRightArrowHovering(false); }}
            cursor="next"
            onClick={() => setNTurns((n) => n + 1)}
          />
        )}
      </animated.group>
    </group>
  );
}
