import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledAboutSection = styled.section`
  max-width: 900px;

  .inner {
    max-width: 600px;
  }
`;
const StyledText = styled.div`
  ul.skills-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(140px, 200px));
    grid-gap: 0 10px;
    padding: 0;
    margin: 20px 0 0 0;
    overflow: hidden;
    list-style: none;

    li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 20px;
      font-family: var(--font-mono);
      font-size: var(--fz-xs);

      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: var(--green);
        font-size: var(--fz-sm);
        line-height: 12px;
      }
    }
  }
`;
const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const skills = [
    'n8n / Workflow Automation',
    'LLM & LAM Integration',
    'PHP / MySQL',
    'Full-Stack Web Development',
    'Git / GitHub',
    'Raspberry Pi / IoT',
  ];

  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <h2 className="numbered-heading">About Me</h2>

      <div className="inner">
        <StyledText>
          <div>
            <p>
              Hello! I'm a Bachelor of Software Engineering student (Information Systems
              Development) at{' '}
              <a href="https://www.ukm.my/" target="_blank" rel="noreferrer">
                Universiti Kebangsaan Malaysia
              </a>{' '}
              (CGPA 3.42, expected Oct 2026), currently working as an AI Automation &amp;
              Full-Stack Developer Intern at{' '}
              <a href="https://www.lekirtech.com/" target="_blank" rel="noreferrer">
                Lekir Tech
              </a>
              .
            </p>

            <p>
              There, I engineer AI agent orchestration workflows using n8n, integrating LLM and LAM
              models into live production environments — including four specialized automation
              workflows built for Mydin (HR, Marketing, Customer Service, Operations) integrated
              with their Lark ecosystem, and technical requirement gathering for an HR Digital
              Worker presented to the IJN Board of Directors. I also maintain the LekirCash
              fintech ecosystem's full-stack updates and transaction flow UX.
            </p>

            <p>
              Before this, I was a Line Cook at Texas Chicken and an Operations Assistant at my
              family's agro-enterprise, where I picked up the same discipline around deadlines and
              quality control that I now bring to engineering work. Two of my earlier projects — a
              Java code-visualization app and a Raspberry Pi–powered smart baby stroller — each won
              gold medals at JIICaS 2023 and ICCI 2020.
            </p>

            <p>Here are a few things I've been working with recently:</p>
          </div>

          <ul className="skills-list">
            {skills && skills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </StyledText>
      </div>
    </StyledAboutSection>
  );
};

export default About;
