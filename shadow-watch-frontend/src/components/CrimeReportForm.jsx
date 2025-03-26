import { useState, useEffect } from 'react';
import { 
  Modal, TextInput, Textarea, SegmentedControl, Button, Group, Paper,
  Title, Text, Divider, useMantineColorScheme, Stepper, ThemeIcon, Stack, Container
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Badge } from '@mantine/core';
import { 
  IconMapPin, IconAlertTriangle, IconChevronLeft, IconChevronRight,
  IconUser, IconFileDescription, IconCheck, IconShield, IconBan
} from '@tabler/icons-react';
import useCrimeStore from '../store/crimestore';

function CrimeReportForm() {
  // Destructure new actions/properties for persistence:
  const { 
    reportForm, toggleReportForm, toggleLocationSelectionMode, addCrime, 
    savedReportData, setSavedReportData 
  } = useCrimeStore();
  
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeStep, setActiveStep] = useState(0);
  
  const [formData, setFormData] = useState({
    report_details: '',
    crime_type: null,
    national_id: '',
    latitude: reportForm.tempLocation?.latitude || '',
    longitude: reportForm.tempLocation?.longitude || '',
  });
  
  const [errors, setErrors] = useState({});

  // On mount, if saved data exists, restore it and merge with any selected location.
  useEffect(() => {
    if (savedReportData) {
      setFormData({
        ...savedReportData,
        latitude: reportForm.tempLocation?.latitude || savedReportData.latitude,
        longitude: reportForm.tempLocation?.longitude || savedReportData.longitude,
      });
    }
  }, [savedReportData, reportForm.tempLocation]);

  // Also update latitude/longitude when tempLocation changes
  useEffect(() => {
    if (reportForm.tempLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: reportForm.tempLocation.latitude,
        longitude: reportForm.tempLocation.longitude
      }));
    }
  }, [reportForm.tempLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCrimeTypeChange = (value) => {
    setFormData(prev => ({ ...prev, crime_type: value }));
    if (errors.crime_type) setErrors(prev => ({ ...prev, crime_type: null }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (formData.crime_type === null) newErrors.crime_type = 'Crime type is required';
      if (!formData.report_details) newErrors.report_details = 'Report details are required';
    }
    if (step === 1) {
      if (!formData.latitude || !formData.longitude) newErrors.location = 'Location is required';
    }
    if (step === 2) {
      if (!formData.national_id) newErrors.national_id = 'National ID is required';
      else if (!/^\d+$/.test(formData.national_id)) newErrors.national_id = 'National ID must contain only numbers';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(activeStep)) setActiveStep(prev => prev + 1); };
  const prevStep = () => setActiveStep(prev => prev - 1);
  const handleSubmit = () => { 
    if (validateStep(activeStep)) {
      addCrime(formData);
      setSavedReportData(null);
      toggleReportForm(); // close the form
      notifications.show({
        title: "Report Submitted!",
        message: "Your crime report was added successfully.",
        color: 'green',
        autoClose: 3000,
        icon: <IconCheck size={16} />,
        position: 'top-center'
      });
      // After 5 seconds, trigger a resize event to refresh the map.
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 5000);
    }
  };
  
  // When closing via cancel, reset state and clear saved data.
  const resetForm = () => {
    setFormData({
      report_details: '',
      crime_type: null,
      national_id: '',
      latitude: '',
      longitude: ''
    });
    setActiveStep(0);
    setErrors({});
    setSavedReportData(null);
  };
  
  const handleClose = () => { resetForm(); toggleReportForm(); };

  // When "Select on Map" is clicked, save the current form data before closing the modal.
  const handleSelectOnMap = () => {
    setSavedReportData(formData);
    toggleReportForm(); // Close the modal (without resetting the inputs)
    toggleLocationSelectionMode(); // Enable map selection.
  };

  const crimeTypes = [
    { label: 'Assault', value: 'Assault', color: '#FF6B6B' },
    { label: 'Robbery', value: 'Robbery', color: '#FFA94D' },
    { label: 'Homicide', value: 'Homicide', color: '#FF5A5F' },
    { label: 'Kidnapping', value: 'Kidnapping', color: '#4DABF7' },
    { label: 'Theft', value: 'Theft', color: '#69DB7C' }
  ];

  return (
    <Modal
      opened={reportForm.isOpen}
      onClose={handleClose}
      title={
        <Group spacing="md" align="center">
          <ThemeIcon variant="filled" color="blue" size="xl" radius="xl">
            <IconAlertTriangle size={24} stroke={1.5} />
          </ThemeIcon>
          <Title order={2} color={isDark ? 'white' : 'dark'}>
            Crime Report Submission
          </Title>
        </Group>
      }
      size="xl"
      radius="lg"
      overlayProps={{ blur: 3, opacity: 0.6 }}
      centered
      styles={{
        modal: { 
          backgroundColor: isDark ? '#1A1B1E' : '#f8f9fa',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          maxWidth: '95vw',
          width: '100%'
        },
        header: { 
          borderBottom: `1px solid ${isDark ? '#2C2E33' : '#e9ecef'}`,
          paddingBottom: 15,
          marginBottom: 15
        }
      }}
    >
      <Container size="md" px={0}>
        <Stack spacing="xl">
          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            color="blue"
            size="md"
            breakpoint="sm"
            styles={{
              // Use "stepLabel" to add top padding to step labels
              stepLabel: { paddingTop: 16 },
              stepBody: { 
                marginBottom: 20,
                '@media (max-width: 768px)': { marginBottom: 10 }
              },
              step: { 
                backgroundColor: isDark ? '#2a2b36' : '#f1f3f5', 
                borderRadius: 16,
                padding: 10
              },
              stepIcon: { 
                borderWidth: 0,
                background: activeStep === 0 
                  ? 'linear-gradient(135deg, #4dabf7, #228be6)' 
                  : isDark ? '#373A40' : '#e9ecef'
              }
            }}
          >
            <Stepper.Step
              icon={<IconFileDescription size={24} stroke={1.5} />}
              label="Incident Details"
              description="Describe the crime"
            >
              <Stack spacing="lg" style={{ paddingTop: '16px' }}>
                <SegmentedControl
                  label="Select Crime Type"
                  data={crimeTypes.map(type => ({
                    label: (
                      <Group spacing="xs" position="center">
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: type.color }} />
                        {type.label}
                      </Group>
                    ),
                    value: type.value
                  }))}
                  value={formData.crime_type || ''}
                  onChange={handleCrimeTypeChange}
                  fullWidth
                  color="blue"
                />
                {errors.crime_type && (
                  <Text color="red" size="sm" weight={500}>
                    {errors.crime_type}
                  </Text>
                )}
                <Textarea
                  label="Detailed Description"
                  placeholder="Provide a comprehensive account of the incident"
                  name="report_details"
                  value={formData.report_details}
                  onChange={handleChange}
                  error={errors.report_details}
                  minRows={8}
                  maxRows={12}
                  autosize
                  required
                />
              </Stack>
            </Stepper.Step>
            
            <Stepper.Step
              icon={<IconMapPin size={24} stroke={1.5} />}
              label="Location"
              description="Pinpoint incident location"
            >
              <Stack spacing="lg" style={{ paddingTop: '16px' }}>
                <Paper
                  withBorder
                  radius="xl"
                  p="xl"
                  style={{
                    backgroundColor: isDark ? '#2a2b36' : '#f8f9fa',
                    border: `1px solid ${isDark ? '#373A40' : '#dee2e6'}`,
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px'
                  }}
                >
                  <Stack spacing="md">
                    <Group position="apart" mb="md">
                      <Title order={4} color={isDark ? 'white' : 'dark'}>
                        <IconMapPin size={22} style={{ marginRight: 10 }} />
                        Crime Location
                      </Title>
                      <Button
                        onClick={handleSelectOnMap}
                        variant="light"
                        color={reportForm.locationSelectionMode ? "red" : "blue"}
                        radius="md"
                        size="sm"
                      >
                        {reportForm.locationSelectionMode ? "Cancel" : "Select on Map"}
                      </Button>
                    </Group>
                    <Group grow>
                      <TextInput
                        label="Latitude"
                        placeholder="Enter latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        error={errors.location}
                        required
                      />
                      <TextInput
                        label="Longitude"
                        placeholder="Enter longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        error={errors.location}
                        required
                      />
                    </Group>
                  </Stack>
                </Paper>
              </Stack>
            </Stepper.Step>
            
            <Stepper.Step
              icon={<IconUser size={24} stroke={1.5} />}
              label="Reporter Info"
              description="Verify your identity"
            >
              <Stack spacing="lg" style={{ paddingTop: '16px' }}>
                <TextInput
                  label="National ID"
                  placeholder="Enter your national ID number"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  error={errors.national_id}
                  icon={<IconShield size={20} />}
                  size="md"
                  required
                />
                <Paper
                  radius="xl"
                  p="lg"
                  style={{
                    backgroundColor: isDark ? 'rgba(37, 38, 43, 0.6)' : 'rgba(248, 249, 250, 0.8)',
                    border: `1px solid ${isDark ? '#373A40' : '#dee2e6'}`,
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px'
                  }}
                >
                  <Text size="sm" color="dimmed" style={{ lineHeight: 1.6 }}>
                    Your national ID is used for verification. We guarantee complete confidentiality and data protection.
                  </Text>
                </Paper>
              </Stack>
            </Stepper.Step>
            
            <Stepper.Completed>
              <Paper
                withBorder
                radius="xl"
                p="xl"
                style={{
                  backgroundColor: isDark ? '#2a2b36' : '#f8f9fa',
                  border: `1px solid ${isDark ? '#373A40' : '#dee2e6'}`,
                  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px'
                }}
              >
                <Stack spacing="lg" style={{ paddingTop: '16px' }}>
                  <Group position="apart" mb="md">
                    <Title order={3} color={isDark ? 'white' : 'dark'}>
                      <IconCheck size={24} style={{ marginRight: 10 }} />
                      Report Summary
                    </Title>
                    <Badge color="blue" variant="light" size="lg">
                      Ready to Submit
                    </Badge>
                  </Group>
                  <Group grow>
                    <Paper withBorder p="md" radius="md">
                      <Text size="xs" color="dimmed" mb={6}>Crime Type</Text>
                      <Text weight={600}>{formData.crime_type}</Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                      <Text size="xs" color="dimmed" mb={6}>Location</Text>
                      <Text>{formData.latitude}, {formData.longitude}</Text>
                    </Paper>
                  </Group>
                  <Textarea
                    label="Incident Details"
                    value={formData.report_details}
                    minRows={6}
                    maxRows={8}
                    readOnly
                  />
                </Stack>
              </Paper>
            </Stepper.Completed>
          </Stepper>

          <Divider my="lg" />

          <Group position="apart">
            {activeStep > 0 ? (
              <Button
                variant="subtle"
                onClick={prevStep}
                leftIcon={<IconChevronLeft size={20} />}
                size="md"
              >
                Back
              </Button>
            ) : (
              <Button variant="subtle" color="red" onClick={handleClose} size="md">
                Cancel
              </Button>
            )}
            
            {activeStep < 3 ? (
              <Button
                onClick={nextStep}
                rightIcon={<IconChevronRight size={20} />}
                variant="filled"
                color="blue"
                size="md"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                leftIcon={<IconCheck size={20} />}
                variant="filled"
                color="green"
                size="md"
              >
                Submit Report
              </Button>
            )}
          </Group>
        </Stack>
      </Container>
    </Modal>
  );
}

export default CrimeReportForm;
