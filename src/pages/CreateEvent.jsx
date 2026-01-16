import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  List,
  Section,
  Input,
  Textarea,
  Button,
} from '@telegram-apps/telegram-ui';
import { Calendar, Clock, MapPin, Users, Image as ImageIcon } from 'lucide-react';
import { Page } from '@/components/Page.jsx';
import { eventsService } from '@/services/api/eventsService.js';
// import useAuth from '@/hooks/useAuth'; // Reserved for future use

export function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  // const { auth } = useAuth(); // Reserved for future use
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    description: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);

  // Fetch event data on mount if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const abortController = new AbortController();

    const fetchEvent = async () => {
      try {
        setFetching(true);
        setError(null);
        const event = await eventsService.getEvent(id, abortController.signal);

        // Parse starts_at to extract date and time
        // Format is expected to be like "Saturday, Dec 23, 8:30 AM" or similar
        let date = '';
        let time = '';
        if (event.starts_at) {
          // Try to parse the starts_at string
          // If it contains a comma, split it
          const parts = event.starts_at.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            // First part(s) are date, last part is time
            date = parts.slice(0, -1).join(', ');
            time = parts[parts.length - 1];
          } else {
            // If no comma, use the whole string as date
            date = event.starts_at;
          }
        }

        setFormData({
          title: event.title || '',
          date: date,
          time: time,
          location: event.location || '',
          maxAttendees: event.capacity?.toString() || '',
          description: event.description || '',
          image: event.image || event.imageUrl || '',
        });
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setError(err.response?.data?.message || err.message || 'Failed to load event');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setFetching(false);
        }
      }
    };

    fetchEvent();

    return () => {
      abortController.abort();
    };
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.date.trim()) {
      setError('Date is required');
      return;
    }
    if (!formData.time.trim()) {
      setError('Time is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formData.maxAttendees || parseInt(formData.maxAttendees) < 1) {
      setError('Maximum attendees must be at least 1');
      return;
    }

    setLoading(true);
    try {
      // Combine date and time into a string for starts_at
      const startsAt = `${formData.date}, ${formData.time}`;

      // Prepare payload according to Swagger documentation
      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        starts_at: startsAt,
        capacity: parseInt(formData.maxAttendees),
      };

      // Add optional fields if they have values
      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      if (isEditMode) {
        await eventsService.updateEvent(id, payload);
      } else {
        await eventsService.createEvent(payload);
      }
      
      navigate('/events');
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Page>
        <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
          Loading event...
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <form onSubmit={handleSubmit}>
        <List>
          <Section header="Event Details">
            <div style={{ padding: '12px 20px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={16} />
                Title *
              </div>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter event title"
              />
            </div>

            <div style={{ padding: '12px 20px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={16} />
                Date *
              </div>
              <Input
                type="text"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                placeholder="Enter date"
              />
            </div>

            <div style={{ padding: '12px 20px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Clock size={16} />
                Time *
              </div>
              <Input
                type="text"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                placeholder="Enter time"
              />
            </div>

            <div style={{ padding: '12px 20px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={16} />
                Location *
              </div>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div style={{ padding: '12px 20px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Users size={16} />
                Maximum Attendees *
              </div>
              <Input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => handleChange('maxAttendees', e.target.value)}
                placeholder="Enter max attendees"
                min="1"
              />
            </div>
          </Section>

          <Section header="Additional Information">
            <div style={{ padding: '12px 20px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ImageIcon size={16} />
                Image URL (Optional)
              </div>
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => handleChange('image', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>

            <div style={{ padding: '12px 20px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px'
              }}>
                Description (Optional)
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={4}
                style={{ 
                  width: '100%',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
          </Section>

          {error && (
            <Section>
              <div style={{ 
                padding: '12px 20px', 
                color: 'var(--tgui--destructive_text_color)',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            </Section>
          )}

          <Section>
            <div style={{ padding: '0 20px 20px' }}>
              <Button
                mode="filled"
                size="l"
                stretched
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </Section>
        </List>
      </form>
    </Page>
  );
}
