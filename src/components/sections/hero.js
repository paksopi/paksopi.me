import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { navDelay, loaderDelay } from '@utils';
import { usePrefersReducedMotion } from '@hooks';
import EmotionDetector from '@components/emotion-detector';

const StyledHeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  /* No fixed height: the emotion widget can make the hero taller than the
     viewport, and a rigid 100vh + vertical centering clips the name off the
     top. min-height lets the section grow; the top padding keeps content clear
     of the fixed nav when it does. */
  padding: 150px 0 80px;

  @media (max-width: 480px) {
    padding-top: 120px;
  }

  .hero-content {
    display: flex;
    align-items: center;
    gap: 60px;
    flex-wrap: wrap;

    @media (max-width: 900px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .hero-text {
    max-width: 640px;
  }

  h1 {
    margin: 0 0 30px 4px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: clamp(var(--fz-sm), 5vw, var(--fz-md));
    font-weight: 400;

    @media (max-width: 480px) {
      margin: 0 0 20px 2px;
    }
  }

  h3 {
    margin-top: 5px;
    color: var(--slate);
    line-height: 0.9;
  }

  p {
    margin: 20px 0 0;
    max-width: 540px;
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
  }
`;

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timeout = setTimeout(() => setIsMounted(true), navDelay);
    return () => clearTimeout(timeout);
  }, []);

  const one = <h1>Hi, my name is</h1>;
  const two = <h2 className="big-heading">Ahmad Syaufi Faid.</h2>;
  const three = <h3 className="big-heading">I build automation and full-stack systems.</h3>;
  const four = (
    <>
      <p>
        I’m a software engineering student and full-stack/AI automation developer. Currently, I’m
        working as an AI Software Specialist at{' '}
        <a href="https://www.beed.world/" target="_blank" rel="noreferrer">
          BEED
        </a>
        .
      </p>
    </>
  );

  const items = [one, two, three, four];

  return (
    <StyledHeroSection>
      <div className="hero-content">
        <div className="hero-text">
          {prefersReducedMotion ? (
            <>
              {items.map((item, i) => (
                <div key={i}>{item}</div>
              ))}
            </>
          ) : (
            <TransitionGroup component={null}>
              {isMounted &&
                items.map((item, i) => (
                  <CSSTransition key={i} classNames="fadeup" timeout={loaderDelay}>
                    <div style={{ transitionDelay: `${i + 1}00ms` }}>{item}</div>
                  </CSSTransition>
                ))}
            </TransitionGroup>
          )}
        </div>

        {isMounted && <EmotionDetector />}
      </div>
    </StyledHeroSection>
  );
};

export default Hero;
