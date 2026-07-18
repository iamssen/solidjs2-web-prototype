import type { Element } from 'solid-js';
import { CompactPreview } from './compact.tsx';
import { MinimalPreview } from './minimal.tsx';
import { SpreadsheetPreview } from './spreadsheet.tsx';
import { StripedPreview } from './striped.tsx';

export function SimpleTablePreview(): Element {
  return (
    <section>
      <h1>Simple table styles</h1>
      <p>Examples of common visual treatments using the same table API.</p>
      <MinimalPreview />
      <SpreadsheetPreview />
      <StripedPreview />
      <CompactPreview />
    </section>
  );
}
