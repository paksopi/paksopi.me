import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import galleryData from '../../gallery-data.json';

const StyledHighlightsSection = styled.section`
  max-width: 900px;

  .cats {
    margin-top: 20px;
  }
  .cat {
    margin-bottom: 35px;
  }
  .cat-name {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 15px;
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
  li {
    position: relative;
    padding-left: 30px;
    margin-bottom: 16px;

    &:before {
      content: '▹';
      position: absolute;
      left: 0;
      top: 2px;
      color: var(--green);
    }
  }
  .item-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;
  }
  .item-title {
    color: var(--lightest-slate);
    font-weight: 600;
    font-size: var(--fz-md);
  }
  .item-date {
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
  }
  .item-desc {
    color: var(--slate);
    font-size: var(--fz-sm);
    margin-top: 3px;
  }

  .gallery-cta {
    ${({ theme }) => theme.mixins.smallButton};
    margin-top: 20px;
  }
`;

// Everything except code Projects (those already have their own grid above).
const CATEGORIES = ['Awards', 'Experience', 'Volunteering'];

const Highlights = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const cats = galleryData.categories.filter(c => CATEGORIES.includes(c.name) && c.entries.length);

  return (
    <StyledHighlightsSection id="highlights" ref={revealContainer}>
      <h2 className="numbered-heading">Awards &amp; Activities</h2>

      <div className="cats">
        {cats.map(category => (
          <div className="cat" key={category.name}>
            <h3 className="cat-name">{category.name}</h3>
            <ul>
              {category.entries.map(entry => (
                <li key={entry.slug}>
                  <div className="item-head">
                    <span className="item-title">{entry.title}</span>
                    {entry.date && <span className="item-date">{entry.date}</span>}
                  </div>
                  {entry.description && <div className="item-desc">{entry.description}</div>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <a className="gallery-cta" href="/gallery">
        View the full gallery (with photos) →
      </a>
    </StyledHighlightsSection>
  );
};

export default Highlights;
