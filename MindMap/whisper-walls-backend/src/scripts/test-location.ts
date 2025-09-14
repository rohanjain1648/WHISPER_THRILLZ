import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import LocationService from '../services/locationService';
import { GeoLocation } from '../types';

// Load environment variables
dotenv.config();

async function testLocationServices() {
  console.log('🧪 Testing Location Services...\n');

  try {
    // Test 1: Location Validation (No DB required)
    console.log('1️⃣ Testing location validation...');
    
    const validLocation: GeoLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
      timestamp: new Date()
    };

    const validation = LocationService.validateLocation(validLocation);
    console.log('✅ Valid location test:', validation.isValid ? 'PASSED' : 'FAILED');
    console.log('   Accuracy level:', validation.accuracy);

    // Test invalid location
    const invalidLocation: GeoLocation = {
      latitude: 91, // Invalid
      longitude: -74.0060,
      accuracy: 10,
      timestamp: new Date()
    };

    const invalidValidation = LocationService.validateLocation(invalidLocation);
    console.log('✅ Invalid location test:', !invalidValidation.isValid ? 'PASSED' : 'FAILED');
    console.log('   Errors:', invalidValidation.errors);

    // Test 2: Distance Calculation
    console.log('\n2️⃣ Testing distance calculation...');
    
    const nyc: GeoLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 0,
      timestamp: new Date()
    };

    const la: GeoLocation = {
      latitude: 34.0522,
      longitude: -118.2437,
      accuracy: 0,
      timestamp: new Date()
    };

    const distance = LocationService.calculateDistance(nyc, la);
    console.log('✅ Distance NYC to LA:', Math.round(distance / 1000), 'km');
    console.log('   Expected: ~3,944 km');

    // Test 3: Coordinate Normalization
    console.log('\n3️⃣ Testing coordinate normalization...');
    
    const normalized = LocationService.normalizeCoordinates(validLocation);
    console.log('✅ Normalized coordinates:', normalized);

    // Test 4: Database Connection (if available)
    console.log('\n4️⃣ Testing database connection...');
    
    try {
      await connectDatabase();
      console.log('✅ Database connection: PASSED');
      
      // Test creating a location message
      console.log('\n5️⃣ Testing message creation...');
      
      const messageData = {
        content: 'Test location message',
        location: validLocation,
        moodEmbedding: {
          emotions: {
            joy: 0.8,
            sadness: 0.1,
            anger: 0.0,
            fear: 0.0,
            surprise: 0.1,
            disgust: 0.0,
            trust: 0.7,
            anticipation: 0.3
          },
          sentiment: 0.7,
          intensity: 0.8,
          timestamp: new Date()
        },
        isAnonymous: true,
        isEphemeral: true
      };

      const message = await LocationService.createLocationMessage(messageData);
      console.log('✅ Message creation: PASSED');
      console.log('   Message ID:', message._id);
      console.log('   Location coordinates:', message.location.coordinates);

      // Test finding nearby messages
      console.log('\n6️⃣ Testing nearby message search...');
      
      const nearbyMessages = await LocationService.findNearbyMessages(validLocation, 1000);
      console.log('✅ Nearby messages search: PASSED');
      console.log('   Found messages:', nearbyMessages.length);

    } catch (dbError) {
      console.log('❌ Database connection: FAILED');
      console.log('   Error:', dbError instanceof Error ? dbError.message : 'Unknown error');
      console.log('   💡 Make sure MongoDB is running or configure MongoDB Atlas');
    }

    console.log('\n🎉 Location services test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testLocationServices();