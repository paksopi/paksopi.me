import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout } from '@components';
import galleryData from '../gallery-data.json';

const StyledGalleryPage = styled.main`
  max-width: 1200px;

  header {
    margin-bottom: 50px;
    text-align: center;
  }
  h1 {
    margin-bottom: 10px;
  }
  .subtitle {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
  }

  .category {
    margin-bottom: 60px;
  }
  .category-name {
    color: var(--lightest-slate);
    font-size: clamp(24px, 5vw, 28px);
    margin: 0 0 25px;
    &:after {
      content: '';
      display: block;
      width: 100%;
      height: 1px;
      margin-top: 12px;
      background-color: var(--lightest-navy);
    }
  }

  .entry {
    margin-bottom: 45px;
  }
  .entry-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .entry-title {
    color: var(--lightest-slate);
    font-size: var(--fz-xl);
    margin: 0;
  }
  .entry-date {
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }
  .entry-desc {
    color: var(--slate);
    font-size: var(--fz-md);
    max-width: 800px;
    margin: 10px 0 20px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
  }
  .card {
    background-color: var(--light-navy);
    border-radius: var(--border-radius);
    overflow: hidden;
    transition: var(--transition);
    &:hover {
      transform: translateY(-5px);
      ${({ theme }) => theme.mixins.boxShadow};
    }
    a {
      display: block;
    }
    img {
      display: block;
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: var(--dark-navy);
    }
    .cap {
      padding: 12px 14px;
    }
    .cap-title {
      color: var(--lightest-slate);
      font-weight: 600;
      font-size: var(--fz-sm);
    }
    .cap-text {
      color: var(--slate);
      font-size: var(--fz-xs);
      margin-top: 4px;
      line-height: 1.4;
    }
  }
`;

const GalleryPage = ({ location }) => 
  // No scroll-reveal here: this is a full content page, and wrapping it in a
  // single reveal left everything at opacity:0 until the tall container crossed
  // the scroll threshold — on mobile that read as a blank page. Render plainly
  // so the gallery is always visible immediately.
  (
    <Layout location={location}>
      <StyledGalleryPage>
        <header>
          <h1 className="big-heading">Gallery</h1>
          <p className="subtitle">Awards, projects, and community work</p>
        </header>

        {galleryData.categories.map(category =>
          category.entries.length ? (
            <section className="category" key={category.name}>
              <h2 className="category-name">{category.name}</h2>

              {category.entries.map(entry => (
                <div className="entry" key={entry.slug}>
                  <div className="entry-head">
                    <h3 className="entry-title">{entry.title}</h3>
                    {entry.date && <span className="entry-date">{entry.date}</span>}
                  </div>
                  {entry.description && <p className="entry-desc">{entry.description}</p>}

                  {entry.images.length > 0 && (
                    <div className="grid">
                      {entry.images.map(img => (
                        <div className="card" key={img.src}>
                          <a href={img.src} target="_blank" rel="noreferrer">
                            <img src={img.src} alt={img.title || entry.title} loading="lazy" />
                          </a>
                          {(img.title || img.caption) && (
                            <div className="cap">
                              {img.title && <div className="cap-title">{img.title}</div>}
                              {img.caption && <div className="cap-text">{img.caption}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          ) : null,
        )}
      </StyledGalleryPage>
    </Layout>
  )
;

GalleryPage.propTypes = {
  location: PropTypes.object.isRequired,
};

export default GalleryPage;
