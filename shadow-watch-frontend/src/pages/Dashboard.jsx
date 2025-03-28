import { useEffect, useState } from 'react';
import { 
  Container, Group, Paper, Title, Button, Text, Divider, useMantineColorScheme,
  ActionIcon, Drawer, Tooltip, Stack, Collapse, Badge
} from '@mantine/core';
import { 
  IconSearch, IconFilter, IconAlertTriangle, IconMoon, IconSun, IconChartBar,
  IconMapPin, IconMenu2, IconChevronRight, IconChevronDown,
  IconChevronUp, IconCalendarEvent, IconX, IconReport
} from '@tabler/icons-react';
import CrimeMap from '../components/CrimeMap';
import CrimeReportForm from '../components/CrimeReportForm';
import StatsPanel from '../components/StatsPanel';
import useCrimeStore from '../store/crimestore';

function Dashboard() {
  const { crimes, filteredCrimes, initializeFromStorage, toggleReportForm, reportForm, filters, setFilter, clearFilters } = useCrimeStore();
  
  // Enhanced Breakpoints
  const BREAKPOINTS = {
    mobile: 640,   // Smallest mobile devices
    tablet: 768,   // Original breakpoint
    desktop: 1024  // Larger screens
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('map');
  
  // Enhanced Mobile and Sidebar State
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    sidebarCollapsed: false
  });
  
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [dateRangeExpanded, setDateRangeExpanded] = useState(false);

  // Enhanced Responsive Detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < BREAKPOINTS.mobile) {
        // Smallest screens: Fully collapsed, minimal UI
        setScreenSize({
          isMobile: true,
          isTablet: false,
          sidebarCollapsed: true
        });
      } else if (width < BREAKPOINTS.tablet) {
        // Smaller tablets/larger phones: Collapsible sidebar
        setScreenSize({
          isMobile: true,
          isTablet: true,
          sidebarCollapsed: true
        });
      } else if (width < BREAKPOINTS.desktop) {
        // Tablets: Semi-expanded sidebar
        setScreenSize({
          isMobile: false,
          isTablet: true,
          sidebarCollapsed: true
        });
      } else {
        // Desktop: Full sidebar
        setScreenSize({
          isMobile: false,
          isTablet: false,
          sidebarCollapsed: false
        });
      }
    };

    // Initial check and setup
    checkScreenSize();
    
    // Add listeners
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);
    
    // Initialize from storage
    initializeFromStorage();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, [initializeFromStorage]);

  // Touch-friendly sidebar toggle
  const handleSidebarToggle = (e) => {
    e.preventDefault();
    
    if (screenSize.isMobile) {
      setScreenSize(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
    } else {
      setScreenSize(prev => ({
        ...prev,
        sidebarCollapsed: !prev.sidebarCollapsed
      }));
    }
  };

  // Render sidebar toggle icon
  const renderSidebarToggleIcon = () => {
    if (screenSize.isMobile) {
      return <IconMenu2 size={18} />;
    }
    return (
      <IconChevronRight 
        size={18} 
        style={{
          transform: screenSize.sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.3s ease'
        }}
      />
    );
  };

  // Rest of the existing calculations
  const pendingCrimes = crimes.filter(c => c.report_status === 'Pending').length;
  const solvedCrimes = crimes.filter(c => c.report_status === 'Resolved').length;
  const totalCrimes = crimes.length;
  
  const crimeTypeCounts = crimes.reduce((acc, crime) => {
    acc[crime.crime_type] = (acc[crime.crime_type] || 0) + 1;
    return acc;
  }, {});

  const navItems = [
    { id: 'map', label: 'Map View', icon: <IconMapPin size={18} stroke={1.5} /> },
    { id: 'stats', label: 'Statistics', icon: <IconChartBar size={18} stroke={1.5} /> }
  ];

  const crimeTypes = ['Assault', 'Robbery', 'Homicide', 'Kidnapping', 'Theft'];
  const statuses = ['Pending', 'En Route', 'On Scene', 'Under Investigation', 'Resolved'];

  return (
    <Container fluid p={0} style={{ height: '100vh', display: 'flex' }}>
      {(!screenSize.isMobile || !screenSize.sidebarCollapsed) && (
        <Paper
          radius={0}
          style={{
            width: screenSize.sidebarCollapsed ? 70 : 250,
            height: '100%',
            borderRight: `1px solid ${isDark ? '#2C2E33' : '#e0e0e0'}`,
            backgroundColor: isDark ? '#1A1B25' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
            zIndex: 10,
            position: screenSize.isMobile ? 'absolute' : 'relative'
          }}
          role="navigation"
          aria-label="Application Sidebar"
          aria-expanded={!screenSize.sidebarCollapsed}
        >
          <div style={{ 
            padding: screenSize.sidebarCollapsed ? '12px 0' : '16px',
            borderBottom: `1px solid ${isDark ? '#2C2E33' : '#e0e0e0'}`,
            display: 'flex',
            justifyContent: screenSize.sidebarCollapsed ? 'center' : 'space-between',
            alignItems: 'center'
          }}>
            {!screenSize.sidebarCollapsed ? (
              <Title order={4} style={{ color: isDark ? '#ffffff' : '#333' }}>
                Shadow Watch
              </Title>
            ) : (
              <Text size="lg" weight={700} style={{ color: isDark ? '#ffffff' : '#333' }}></Text>
            )}
            {/* In mobile mode, add an extra close button */}
            {screenSize.isMobile && !screenSize.sidebarCollapsed && (
              <ActionIcon onClick={() => setScreenSize(prev => ({ ...prev, sidebarCollapsed: true }))}>
                <IconX size={18} />
              </ActionIcon>
            )}
            {/* For non-mobile screens, use the toggle icon */}
            {!screenSize.isMobile && (
              <ActionIcon onClick={handleSidebarToggle}>
                {renderSidebarToggleIcon()}
              </ActionIcon>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: screenSize.sidebarCollapsed ? '12px 0' : '16px 0' }}>
            {navItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: screenSize.sidebarCollapsed ? '12px 0' : '10px 16px',
                  marginBottom: 4,
                  borderRadius: 4,
                  backgroundColor: activeTab === item.id 
                    ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') 
                    : 'transparent',
                  color: activeTab === item.id 
                    ? (isDark ? '#ffffff' : '#333') 
                    : (isDark ? '#c1c2c5' : '#495057'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: screenSize.sidebarCollapsed ? 'center' : 'flex-start',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {item.icon}
                {!screenSize.sidebarCollapsed && (
                  <Text ml="md" size="sm" weight={activeTab === item.id ? 500 : 400}>
                    {item.label}
                  </Text>
                )}
                {!screenSize.sidebarCollapsed && item.id === 'stats' && totalCrimes > 0 && (
                  <Text ml="auto" size="xs" color="dimmed">{totalCrimes}</Text>
                )}
              </div>
            ))}

            {!screenSize.sidebarCollapsed && (
              <>
                <Divider
                  my="md"
                  style={{ borderColor: isDark ? '#2C2E33' : '#e0e0e0' }}
                />
                <div
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  style={{
                    padding: '10px 16px',
                    marginBottom: 4,
                    borderRadius: 4,
                    backgroundColor: filtersExpanded
                      ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                      : 'transparent',
                    color: filtersExpanded
                      ? (isDark ? '#ffffff' : '#333')
                      : (isDark ? '#c1c2c5' : '#495057'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <Group>
                    <IconFilter size={18} stroke={1.5} />
                    <Text size="sm" weight={filtersExpanded ? 500 : 400} style={{ color: isDark ? '#f8f9fa' : '#333' }}>
                      Filters
                    </Text>
                  </Group>
                  {filtersExpanded ? <IconChevronUp size={16} stroke={1.5} /> : <IconChevronDown size={16} stroke={1.5} />}
                </div>

                <Collapse in={filtersExpanded}>
                  <div style={{ padding: '0 16px 16px' }}>
                    <Group position="apart" mb="xs">
                      <Text size="xs" weight={500} style={{ color: isDark ? '#f8f9fa' : '#333' }}>
                        Filters
                      </Text>
                      {(filters.crimeType || filters.status || filters.search) && (
                        <Button 
                          variant="subtle" 
                          size="xs"
                          compact
                          leftIcon={<IconX size={12} stroke={1.5} />}
                          onClick={clearFilters}
                          color={isDark ? "gray" : "dark"}
                          radius="sm"
                          p={4}
                        >
                          Clear
                        </Button>
                      )}
                    </Group>
                    
                    <Text weight={500} mb="xs" size="xs" style={{ color: isDark ? '#f8f9fa' : '#333' }}>
                      Crime Type
                    </Text>
                    <Group spacing="xs" mb="md">
                      {crimeTypes.map(type => (
                        <Badge 
                          key={type}
                          size="sm"
                          radius="sm"
                          variant={filters.crimeType === type ? "filled" : "light"}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: filters.crimeType === type ? 
                              (type === 'Robbery' ? '#d00000' : 
                               type === 'Assault' ? '#ffaa00' : 
                               type === 'Homicide' ? '#dc2f02' : 
                               type === 'Kidnapping' ? '#00b4d8' : 
                               type === 'Theft' ? '#f72585' : '#5e60ce') : 
                              isDark ? '#2C2E33' : '#f1f3f5',
                            color: filters.crimeType === type ? '#ffffff' : (isDark ? '#f8f9fa' : '#495057'),
                            border: 'none'
                          }}
                          onClick={() => setFilter('crimeType', filters.crimeType === type ? null : type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </Group>
                    
                    <Text weight={500} mb="xs" size="xs" style={{ color: isDark ? '#f8f9fa' : '#333' }}>
                      Status
                    </Text>
                    <Group spacing="xs" mb="md">
                      {statuses.map(status => (
                        <Badge 
                          key={status}
                          size="sm"
                          radius="sm"
                          variant={filters.status === status ? "filled" : "light"}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: filters.status === status ? 
                              (status === 'Pending' ? '#faa307' : 
                               status === 'Resolved' ? '#38b000' : 
                               status === 'En Route' ? '#3a86ff' : 
                               status === 'On Scene' ? '#6a00f4' : 
                               status === 'Under Investigation' ? '#6930c3' : '#5e60ce') : 
                              isDark ? '#2C2E33' : '#f1f3f5',
                            color: filters.status === status ? '#ffffff' : (isDark ? '#f8f9fa' : '#495057'),
                            border: 'none'
                          }}
                          onClick={() => setFilter('status', filters.status === status ? null : status)}
                        >
                          {status}
                        </Badge>
                      ))}
                    </Group>
                    
                    {(filters.crimeType || filters.status || filters.search) && (
                      <Paper 
                        p="xs" 
                        mt="sm"
                        radius="sm"
                        style={{
                          backgroundColor: isDark ? 'rgba(105,48,195,0.1)' : 'rgba(94,96,206,0.05)',
                          border: `1px solid ${isDark ? 'rgba(105,48,195,0.2)' : 'rgba(94,96,206,0.2)'}`
                        }}
                      >
                        <Group position="apart">
                          <Text size="xs" style={{ color: isDark ? "#f8f9fa" : "#5e60ce" }}>
                            Active filters: {[
                              filters.crimeType ? `Type: ${filters.crimeType}` : null,
                              filters.status ? `Status: ${filters.status}` : null,
                              filters.search ? `Search: "${filters.search}"` : null
                            ].filter(Boolean).join(', ')}
                          </Text>
                        </Group>
                      </Paper>
                    )}
                  </div>
                </Collapse>
              </>
            )}
          </div>

          <div style={{ 
            padding: screenSize.sidebarCollapsed ? '12px 0' : '16px',
            borderTop: `1px solid ${isDark ? '#2C2E33' : '#e0e0e0'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            {!screenSize.sidebarCollapsed ? (
              <Button
                leftIcon={<IconAlertTriangle size={16} stroke={1.5} />}
                color="red"
                fullWidth
                size="sm"
                style={{ justifyContent: screenSize.sidebarCollapsed ? 'center' : 'flex-start' }}
                onClick={toggleReportForm}
              >
                Report Crime
              </Button>
            ) : (
              <>
                <Tooltip label="Report Crime" position="right">
                  <Button
                    variant="subtle"
                    color="red"
                    fullWidth
                    size="sm"
                    style={{ justifyContent: 'center' }}
                    onClick={toggleReportForm}
                  >
                    <IconReport size={16} stroke={1.5} />
                  </Button>
                </Tooltip>
              </>
            )}
            
            <Tooltip label={isDark ? "Light mode" : "Dark mode"} position="right">
              <ActionIcon
                variant="subtle"
                color={isDark ? "yellow" : "blue"}
                onClick={() => toggleColorScheme()}
                size="md"
                style={{ margin: screenSize.sidebarCollapsed ? 'auto' : '8px 0 0' }}
              >
                {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
              </ActionIcon>
            </Tooltip>
          </div>
        </Paper>
      )}

      {/* Floating open sidebar button for mobile mode */}
      {screenSize.isMobile && screenSize.sidebarCollapsed && (
        <ActionIcon 
          onClick={() => setScreenSize(prev => ({ ...prev, sidebarCollapsed: false }))}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 30,
            backgroundColor: isDark ? 'blue' : 'blue',  // New custom color for the button
            border: `1px solid ${isDark ? '#2C2E33' : '#e0e0e0'}`,
            borderRadius: 4,
            padding: 4
          }}
          aria-label="Open Sidebar"
        >
          <IconMenu2 size={20} />
        </ActionIcon>
      )}

      {/* Main content area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* In mobile mode, only render the search bar if sidebar is collapsed */}
        {activeTab === 'map' && (!screenSize.isMobile || screenSize.sidebarCollapsed) && (
          <Paper
            p="xs"
            radius={0}
            style={{
              backgroundColor: isDark ? '#21222c' : '#ffffff',
              borderBottom: `1px solid ${isDark ? '#2C2E33' : '#e0e0e0'}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isDark ? '#2a2b36' : '#f5f5f5',
                padding: screenSize.isMobile ? '6px 10px' : '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${isDark ? '#32343e' : '#e6e6e6'}`,
              }}
            >
              <IconSearch 
                size={screenSize.isMobile ? 14 : 16} 
                stroke={1.5} 
                color={isDark ? '#f8f9fa' : '#495057'} 
                style={{ marginRight: 8 }} 
              />
              <input
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: isDark ? '#f8f9fa' : '#333',
                  width: '100%',
                  fontSize: screenSize.isMobile ? '12px' : '14px',
                  padding: screenSize.isMobile ? '4px 10px' : 'initial'  // Added left/right padding for mobile
                }}
                placeholder={screenSize.isMobile ? "Search crimes..." : "Search crimes by type, details, status..."}
                onChange={(e) => useCrimeStore.getState().setFilter('search', e.target.value)}
              />
            </div>
          </Paper>
        )}

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {activeTab === 'map' && (
            <div style={{ height: '100%' }}>
              <CrimeMap isDark={isDark} sidebarCollapsed={screenSize.sidebarCollapsed} isMobile={screenSize.isMobile} />
            </div>
          )}
          {activeTab === 'stats' && (
            <div style={{
              height: '100%',
              overflow: 'auto',
              padding: '16px',
              backgroundColor: isDark ? '#1A1B25' : '#f8f9fa'
            }}>
              <StatsPanel
                pendingCrimes={pendingCrimes}
                solvedCrimes={solvedCrimes}
                totalCrimes={totalCrimes}
                crimeTypeCounts={crimeTypeCounts}
                isDark={isDark}
              />
            </div>
          )}
        </div>
      </div>

      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Statistics"
        padding="lg"
        size="md"
        position="right"
        styles={{
          title: { color: isDark ? '#f8f9fa' : '#1A1B1E', fontWeight: 500 },
          header: { backgroundColor: isDark ? '#1A1B25' : '#ffffff', borderBottom: `1px solid ${isDark ? '#2C2E33' : '#e9ecef'}` },
          body: { backgroundColor: isDark ? '#21222c' : '#ffffff' },
          closeButton: { color: isDark ? '#c1c2c5' : '#495057' }
        }}
      >
        <StatsPanel
          pendingCrimes={pendingCrimes}
          solvedCrimes={solvedCrimes}
          totalCrimes={totalCrimes}
          crimeTypeCounts={crimeTypeCounts}
          isDark={isDark}
        />
      </Drawer>

      {reportForm.isOpen && <CrimeReportForm />}
    </Container>
  );
}

export default Dashboard;
