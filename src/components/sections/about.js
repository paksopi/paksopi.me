import React, { useEffect, useRef } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledAboutSection = styled.section`
  max-width: 900px;

  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 50px;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;
const StyledPic = styled.div`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    width: 70%;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--green);

    &:hover,
    &:focus {
      outline: 0;
      transform: translate(-4px, -4px);
      &:after {
        transform: translate(8px, 8px);
      }
      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1);
      transition: var(--transition);
    }

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }
    &:before {
      top: 0;
      left: 0;
      background-color: var(--navy);
      mix-blend-mode: screen;
    }
    &:after {
      border: 2px solid var(--green);
      top: 14px;
      left: 14px;
      z-index: -1;
    }
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
    'Docker / Docker Compose',
    'Raspberry Pi / IoT',
    'Self-Hosting / Linux Servers',
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
              (CGPA 3.42, expected Oct 2026), currently working as an AI Software Specialist at{' '}
              <a href="https://www.beed.world/" target="_blank" rel="noreferrer">
                BEED
              </a>
              .
            </p>

            <p>
              Before this, I interned at Lekir Tech as an AI Automation &amp; Full-Stack Developer,
              where I engineered AI agent orchestration workflows using n8n, integrating LLM and LAM
              models into live production environments — including four specialized automation
              workflows built for Mydin (HR, Marketing, Customer Service, Operations) integrated
              with their Lark ecosystem, and technical requirement gathering for an HR Digital
              Worker presented to the IJN Board of Directors. I also maintained the LekirCash
              fintech ecosystem's full-stack updates and transaction flow UX.
            </p>

            <p>
              Earlier still, I was a Line Cook at Texas Chicken and an Operations Assistant at my
              family's agro-enterprise, where I picked up the same discipline around deadlines and
              quality control that I now bring to engineering work. Two of my earlier projects — a
              Java code-visualization app and a Raspberry Pi–powered smart baby stroller — each won
              gold medals at JIICaS 2023 and ICCI 2020. I completed my secondary education in the
              Pure Science stream at Sekolah Menengah Sains Kuala Selangor (KUSESS).
            </p>

            <p>
              Outside of work, I run this site — along with an AI agent, a Cloudflare Tunnel with
              zero inbound ports opened, and this project's own CI/CD pipeline — on a personal
              homelab: an old laptop repurposed into an always-on server, with every service
              containerized in its own Docker Compose stack under a tight RAM budget. It's where I
              actually use the infra skills I talk about, not just read about them.
            </p>

            <p>
              You can see my awards, projects, and volunteer work in the{' '}
              <a href="/gallery">gallery</a>.
            </p>

            <p>Here are a few things I've been working with recently:</p>
          </div>

          <ul className="skills-list">
            {skills && skills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </StyledText>

        <StyledPic>
          <div className="wrapper">
            <StaticImage
              className="img"
              src="../../images/me.jpg"
              width={500}
              quality={95}
              formats={['AUTO', 'WEBP', 'AVIF']}
              alt="Ahmad Syaufi Faid"
            />
          </div>
        </StyledPic>
      </div>
    </StyledAboutSection>
  );
};

export default About;
