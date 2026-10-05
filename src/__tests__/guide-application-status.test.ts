import { describe, expect, it } from 'vitest';
import {
  getAccountProvisioningContent,
  getPublicationStatusContent,
} from '../pages/GuideApplication';

describe('GuideApplication status helpers', () => {
  it('accepted invitation never claims delivery confirmation', () => {
    const content = getAccountProvisioningContent('pending', 'accepted');

    expect(content.label).toBe('Pending');
    expect(content.detail).toContain('accepted the send request');
    expect(content.detail.toLowerCase()).toContain('unconfirmed');
    expect(content.detail.toLowerCase()).not.toContain('delivered');
  });

  it('failed invitation explains recovery steps', () => {
    const content = getAccountProvisioningContent('pending', 'failed');

    expect(content.detail).toContain('could not be sent');
    expect(content.detail).toContain('Confirm the email address');
    expect(content.detail).toContain('send a new invitation');
  });

  it('missing publication data never claims services are active', () => {
    const content = getPublicationStatusContent(undefined);

    expect(content.label).toBe('Unknown');
    expect(content.detail).toContain('No service should be assumed active');
    expect(content.detail.toLowerCase()).not.toContain('services are active');
  });

  it('active publication states that actual services are active', () => {
    const content = getPublicationStatusContent('active');

    expect(content.label).toBe('Active');
    expect(content.detail).toContain('service is active');
  });

  it('draft publication states owner activation follows verification', () => {
    const content = getPublicationStatusContent('draft');

    expect(content.label).toBe('Draft');
    expect(content.detail).toContain('owner activates them after verification');
  });
});
