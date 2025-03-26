import { 
  Paper, Title, Text, Group, RingProgress, Stack, Divider, Grid,
  ThemeIcon, Card, SimpleGrid
} from '@mantine/core';
import { 
  IconChartBar, IconAlertTriangle, IconCheckbox, IconClock,
  IconChartPie, IconMap, IconCalendar
} from '@tabler/icons-react';

function StatsPanel({ pendingCrimes, solvedCrimes, totalCrimes, crimeTypeCounts, isDark }) {
  const solvedPercentage = totalCrimes > 0 ? Math.round((solvedCrimes / totalCrimes) * 100) : 0;
  const pendingPercentage = totalCrimes > 0 ? Math.round((pendingCrimes / totalCrimes) * 100) : 0;
  
  const crimeTypeData = Object.entries(crimeTypeCounts).map(([type, count]) => {
    const colorMap = {
      'Robbery': '#d00000',
      'Assault': '#ffaa00',
      'Homicide': '#dc2f02',
      'Kidnapping': '#00b4d8',
      'Theft': '#f72585'
    };
    return {
      value: (count / totalCrimes) * 100,
      color: colorMap[type] || '#228be6',
      tooltip: `${type}: ${count}`,
    };
  });
  
  const textColor = isDark ? '#f8f9fa' : '#333';
  
  return (
    <div>
      <Paper 
        p="md" 
        withBorder
        radius="md"
        mb="lg"
        style={{
          backgroundColor: isDark ? '#2a2b36' : '#ffffff',
          borderColor: isDark ? '#373A40' : '#e9ecef',
          overflow: 'hidden',
          color: textColor
        }}
      >
        <Group position="apart" mb={20}>
          <Group spacing={10}>
            <ThemeIcon 
              size="md" 
              radius="md"
              gradient={{ from: '#5e60ce', to: '#6930c3', deg: 135 }}
              variant="gradient"
            >
              <IconChartBar size={16} />
            </ThemeIcon>
            <Title order={4} style={{ color: textColor }}>Crime Statistics</Title>
          </Group>
          <Text size="xs" color="dimmed" weight={500}>Last updated: {new Date().toLocaleDateString()}</Text>
        </Group>
          
        <SimpleGrid cols={3} spacing="md" mb="xl" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <Card 
            p="md" 
            radius="md" 
            withBorder
            style={{
              backgroundColor: isDark ? '#21222c' : '#f8f9fa',
              borderColor: isDark ? '#373A40' : '#e9ecef',
              color: textColor
            }}
          >
            <Group position="apart" noWrap>
              <div>
                <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                  Total Crimes
                </Text>
                <Text size="xl" weight={700} mt={4} style={{ color: textColor }}>
                  {totalCrimes}
                </Text>
              </div>
              <ThemeIcon 
                size={48} 
                radius="md"
                variant="light"
                color={isDark ? "blue" : "indigo"}
                style={{ backgroundColor: isDark ? 'rgba(51,154,240,0.1)' : 'rgba(92,124,250,0.1)' }}
              >
                <IconMap size={24} stroke={1.5} />
              </ThemeIcon>
            </Group>
          </Card>
            
          <Card 
            p="md" 
            radius="md" 
            withBorder
            style={{
              backgroundColor: isDark ? '#21222c' : '#f8f9fa',
              borderColor: isDark ? '#373A40' : '#e9ecef',
              color: textColor
            }}
          >
            <Group position="apart" noWrap>
              <div>
                <Text size="xs" color={isDark ? "#ffcc00" : "orange"} transform="uppercase" weight={700}>
                  Pending
                </Text>
                <Text size="xl" weight={700} mt={4} style={{ color: isDark ? "#ffcc00" : "orange" }}>
                  {pendingCrimes}
                </Text>
                <Text size="xs" color="dimmed" mt={2}>
                  {pendingPercentage}% of total
                </Text>
              </div>
              <ThemeIcon 
                size={48} 
                radius="md"
                variant="light"
                color="orange"
                style={{ backgroundColor: isDark ? 'rgba(252,163,17,0.15)' : 'rgba(255,170,0,0.15)' }}
              >
                <IconClock size={24} stroke={1.5} />
              </ThemeIcon>
            </Group>
          </Card>
            
          <Card 
            p="md" 
            radius="md" 
            withBorder
            style={{
              backgroundColor: isDark ? '#21222c' : '#f8f9fa',
              borderColor: isDark ? '#373A40' : '#e9ecef',
              color: textColor
            }}
          >
            <Group position="apart" noWrap>
              <div>
                <Text size="xs" color={isDark ? "#38b000" : "green"} transform="uppercase" weight={700}>
                  Resolved
                </Text>
                <Text size="xl" weight={700} mt={4} style={{ color: isDark ? "#38b000" : "green" }}>
                  {solvedCrimes}
                </Text>
                <Text size="xs" color="dimmed" mt={2}>
                  {solvedPercentage}% of total
                </Text>
              </div>
              <ThemeIcon 
                size={48} 
                radius="md"
                variant="light"
                color="green"
                style={{ backgroundColor: isDark ? 'rgba(56,176,0,0.15)' : 'rgba(56,176,0,0.15)' }}
              >
                <IconCheckbox size={24} stroke={1.5} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>
          
        <Grid gutter="md">
          <Grid.Col span={12} md={6}>
            <Card 
              p="md" 
              radius="md" 
              withBorder
              style={{
                backgroundColor: isDark ? '#21222c' : '#f8f9fa',
                borderColor: isDark ? '#373A40' : '#e9ecef',
                height: '100%',
                color: textColor
              }}
            >
              <Group position="apart" mb="xs">
                <Group spacing={8}>
                  <ThemeIcon 
                    size="sm" 
                    radius="md"
                    variant="light"
                    color={isDark ? "violet" : "grape"}
                  >
                    <IconChartPie size={14} />
                  </ThemeIcon>
                  <Text weight={600} size="sm" style={{ color: textColor }}>Crime Type Distribution</Text>
                </Group>
              </Group>
                
              <Group position="center" py="md">
                <RingProgress
                  size={160}
                  thickness={16}
                  sections={crimeTypeData}
                  label={
                    <div style={{ textAlign: 'center', color: textColor }}>
                      <Text size="xs" color="dimmed">Total</Text>
                      <Text weight={700} size="lg">{totalCrimes}</Text>
                    </div>
                  }
                  roundCaps
                />
              </Group>
                
              <Stack spacing={8} mt="md">
                {Object.entries(crimeTypeCounts).map(([type, count]) => (
                  <Group key={type} position="apart" spacing="xs">
                    <Group spacing={8}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: type === 'Robbery' ? '#d00000' : 
                                          type === 'Assault' ? '#ffaa00' : 
                                          type === 'Homicide' ? '#dc2f02' : 
                                          type === 'Kidnapping' ? '#00b4d8' : 
                                          '#f72585'
                        }}
                      />
                      <Text size="xs" style={{ color: textColor }}>{type}</Text>
                    </Group>
                    <Text size="xs" weight={500} style={{ color: textColor }}>
                      {count} ({Math.round((count / totalCrimes) * 100)}%)
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
            
          <Grid.Col span={12} md={6}>
            <Card 
              p="md" 
              radius="md" 
              withBorder
              style={{
                backgroundColor: isDark ? '#21222c' : '#f8f9fa',
                borderColor: isDark ? '#373A40' : '#e9ecef',
                height: '100%',
                color: textColor
              }}
            >
              <Group position="apart" mb="md">
                <Group spacing={8}>
                  <ThemeIcon 
                    size="sm" 
                    radius="md"
                    variant="light"
                    color={isDark ? "green" : "teal"}
                  >
                    <IconCalendar size={14} />
                  </ThemeIcon>
                  <Text weight={600} size="sm" style={{ color: textColor }}>Case Resolution Rate</Text>
                </Group>
              </Group>
                
              <Group position="center" py="md">
                <RingProgress
                  size={160}
                  thickness={16}
                  sections={[
                    { value: solvedPercentage, color: '#38b000' },
                    { value: pendingPercentage, color: '#faa307' },
                  ]}
                  label={
                    <div style={{ textAlign: 'center', color: textColor }}>
                      <Text weight={700} size="lg">{solvedPercentage}%</Text>
                      <Text size="xs" color="dimmed">Resolved</Text>
                    </div>
                  }
                  roundCaps
                />
              </Group>
                
              <Stack spacing={8} mt="lg">
                <Group position="apart">
                  <Group spacing={8}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#38b000' }} />
                    <Text size="xs" style={{ color: textColor }}>Resolved</Text>
                  </Group>
                  <Text size="xs" weight={500} style={{ color: textColor }}>{solvedCrimes} Crimes</Text>
                </Group>
                  
                <Group position="apart">
                  <Group spacing={8}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#faa307' }} />
                    <Text size="xs" style={{ color: textColor }}>Pending</Text>
                  </Group>
                  <Text size="xs" weight={500} style={{ color: textColor }}>{pendingCrimes} Crimes</Text>
                </Group>
              </Stack>
                
              <Paper 
                p="sm" 
                mt="lg"
                radius="md"
                style={{
                  backgroundColor: isDark ? 'rgba(56,176,0,0.1)' : 'rgba(56,176,0,0,0.1)',
                  border: `1px solid ${isDark ? 'rgba(56,176,0,0.2)' : 'rgba(56,176,0,0.2)'}`
                }}
              >
                <Group spacing={8}>
                  <ThemeIcon 
                    size="sm" 
                    radius="xl"
                    color="green"
                    variant="light"
                  >
                    <IconCheckbox size={12} />
                  </ThemeIcon>
                  <Text size="xs" style={{ color: isDark ? "#f8f9fa" : "#333" }}>
                    {solvedPercentage > 50 ? 'Good resolution rate' : 'Working on improving resolution rate'}
                  </Text>
                </Group>
              </Paper>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>
    </div>
  );
}

export default StatsPanel;
