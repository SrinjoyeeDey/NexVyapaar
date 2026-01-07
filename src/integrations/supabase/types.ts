export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string | null
          description: string
          id: string
          insight_type: string
          is_read: boolean | null
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          is_read?: boolean | null
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          is_read?: boolean | null
          priority?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          created_at: string
          description: string
          id: string
          impact_score: number | null
          is_read: boolean | null
          recommendation_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          impact_score?: number | null
          is_read?: boolean | null
          recommendation_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          impact_score?: number | null
          is_read?: boolean | null
          recommendation_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          audience_type: string | null
          channels: string[]
          clicked_count: number | null
          content: string
          created_at: string
          delivered_count: number | null
          estimated_cost: number | null
          id: string
          media_urls: string[] | null
          message_type: string
          opened_count: number | null
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_type?: string | null
          channels?: string[]
          clicked_count?: number | null
          content: string
          created_at?: string
          delivered_count?: number | null
          estimated_cost?: number | null
          id?: string
          media_urls?: string[] | null
          message_type?: string
          opened_count?: number | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_type?: string | null
          channels?: string[]
          clicked_count?: number | null
          content?: string
          created_at?: string
          delivered_count?: number | null
          estimated_cost?: number | null
          id?: string
          media_urls?: string[] | null
          message_type?: string
          opened_count?: number | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      civic_connections: {
        Row: {
          civic_id: string
          connected_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          civic_id: string
          connected_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          civic_id?: string
          connected_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          boost_until: string | null
          category: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          likes_count: number | null
          media_urls: string[] | null
          moderation_flags: string[] | null
          moderation_scores: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          boost_until?: string | null
          category: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          moderation_flags?: string[] | null
          moderation_scores?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          boost_until?: string | null
          category?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          moderation_flags?: string[] | null
          moderation_scores?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          created_at: string | null
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          content: string
          created_at: string | null
          description: string
          difficulty: string
          duration_minutes: number
          id: string
          is_published: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          description: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      customer_consents: {
        Row: {
          announcements: boolean | null
          civic_verified: boolean | null
          consent_status: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          engagement_rate: number | null
          id: string
          last_contacted_at: string | null
          marketing_offers: boolean | null
          messages_received: number | null
          product_updates: boolean | null
          sms_notifications: boolean | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          announcements?: boolean | null
          civic_verified?: boolean | null
          consent_status?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          engagement_rate?: number | null
          id?: string
          last_contacted_at?: string | null
          marketing_offers?: boolean | null
          messages_received?: number | null
          product_updates?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          announcements?: boolean | null
          civic_verified?: boolean | null
          consent_status?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          engagement_rate?: number | null
          id?: string
          last_contacted_at?: string | null
          marketing_offers?: boolean | null
          messages_received?: number | null
          product_updates?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      customer_feedback: {
        Row: {
          created_at: string | null
          customer_name: string | null
          feedback_date: string
          feedback_text: string
          id: string
          rating: number | null
          sentiment: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          feedback_date?: string
          feedback_text: string
          id?: string
          rating?: number | null
          sentiment?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          feedback_date?: string
          feedback_text?: string
          id?: string
          rating?: number | null
          sentiment?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finished_products: {
        Row: {
          category: string | null
          cost_to_produce: number | null
          created_at: string | null
          current_stock: number | null
          expiry_date: string | null
          id: string
          name: string
          reorder_point: number | null
          selling_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_to_produce?: number | null
          created_at?: string | null
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          name: string
          reorder_point?: number | null
          selling_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          cost_to_produce?: number | null
          created_at?: string | null
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          name?: string
          reorder_point?: number | null
          selling_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      low_stock_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          current_value: number | null
          id: string
          is_acknowledged: boolean | null
          material_id: string | null
          message: string
          product_id: string | null
          threshold_value: number | null
          user_id: string
        }
        Insert: {
          alert_type?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_acknowledged?: boolean | null
          material_id?: string | null
          message: string
          product_id?: string | null
          threshold_value?: number | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_acknowledged?: boolean | null
          material_id?: string | null
          message?: string
          product_id?: string | null
          threshold_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "low_stock_alerts_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "low_stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "finished_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          campaign_name: string
          content_type: string
          created_at: string
          generated_content: string
          id: string
          metadata: Json | null
          schedule_time: string
          status: string
          user_id: string
        }
        Insert: {
          campaign_name: string
          content_type: string
          created_at?: string
          generated_content: string
          id?: string
          metadata?: Json | null
          schedule_time: string
          status?: string
          user_id: string
        }
        Update: {
          campaign_name?: string
          content_type?: string
          created_at?: string
          generated_content?: string
          id?: string
          metadata?: Json | null
          schedule_time?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      product_ingredients: {
        Row: {
          created_at: string | null
          id: string
          material_id: string
          product_id: string
          quantity_required: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id: string
          product_id: string
          quantity_required: number
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string
          product_id?: string
          quantity_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "finished_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string
          business_type: Database["public"]["Enums"]["business_type"] | null
          created_at: string | null
          display_name: string | null
          id: string
          location: string | null
          subscription_tier:
          | Database["public"]["Enums"]["subscription_tier"]
          | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name: string
          business_type?: Database["public"]["Enums"]["business_type"] | null
          created_at?: string | null
          display_name?: string | null
          id: string
          location?: string | null
          subscription_tier?:
          | Database["public"]["Enums"]["subscription_tier"]
          | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string
          business_type?: Database["public"]["Enums"]["business_type"] | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          subscription_tier?:
          | Database["public"]["Enums"]["subscription_tier"]
          | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          material_id: string | null
          product_id: string | null
          purchase_order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          product_id?: string | null
          purchase_order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          product_id?: string | null
          purchase_order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "finished_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          created_at: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string | null
          po_number: string
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          po_number: string
          status?: string
          supplier_id: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          po_number?: string
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_materials: {
        Row: {
          burn_rate: number | null
          expiry_date: string | null
          batch_number: string | null
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          current_stock: number | null
          id: string
          last_ordered_at: string | null
          name: string
          optimal_stock_level: number | null
          reorder_point: number | null
          seasonality_tag: string | null
          supplier_id: string | null
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          burn_rate?: number | null
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          last_ordered_at?: string | null
          name: string
          optimal_stock_level?: number | null
          reorder_point?: number | null
          seasonality_tag?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          burn_rate?: number | null
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          last_ordered_at?: string | null
          name?: string
          optimal_stock_level?: number | null
          reorder_point?: number | null
          seasonality_tag?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          referrer_id: string
          rewards_earned: number | null
          total_referrals: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          referrer_id: string
          rewards_earned?: number | null
          total_referrals?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          referrer_id?: string
          rewards_earned?: number | null
          total_referrals?: number | null
        }
        Relationships: []
      }
      sales_data: {
        Row: {
          burn_rate: number | null
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          id: string
          price: number
          product_name: string
          quantity: number
          expiry_date: string | null
          batch_number: string | null
          sale_date: string
          seasonality_tag: string | null
          user_id: string
          waste_quantity: number | null
        }
        Insert: {
          burn_rate?: number | null
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          price: number
          product_name: string
          quantity: number
          sale_date?: string
          seasonality_tag?: string | null
          user_id: string
          waste_quantity?: number | null
        }
        Update: {
          burn_rate?: number | null
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          price?: number
          product_name?: string
          quantity?: number
          expiry_date?: string | null
          batch_number?: string | null
          sale_date?: string
          seasonality_tag?: string | null
          user_id?: string
          waste_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_price_history: {
        Row: {
          id: string
          material_id: string | null
          notes: string | null
          price_per_unit: number
          product_id: string | null
          recorded_at: string
          supplier_id: string
          supplier_price_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          material_id?: string | null
          notes?: string | null
          price_per_unit: number
          product_id?: string | null
          recorded_at?: string
          supplier_id: string
          supplier_price_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          material_id?: string | null
          notes?: string | null
          price_per_unit?: number
          product_id?: string | null
          recorded_at?: string
          supplier_id?: string
          supplier_price_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_price_history_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "finished_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_price_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_price_history_supplier_price_id_fkey"
            columns: ["supplier_price_id"]
            isOneToOne: false
            referencedRelation: "supplier_prices"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_prices: {
        Row: {
          created_at: string | null
          id: string
          material_id: string | null
          minimum_order_quantity: number | null
          price_per_unit: number
          product_id: string | null
          supplier_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          minimum_order_quantity?: number | null
          price_per_unit: number
          product_id?: string | null
          supplier_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          minimum_order_quantity?: number | null
          price_per_unit?: number
          product_id?: string | null
          supplier_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_prices_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "finished_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_prices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          delivery_time_days: number | null
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_gateway: string
          status: string
          subscription_type: string | null
          transaction_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_gateway: string
          status?: string
          subscription_type?: string | null
          transaction_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_gateway?: string
          status?: string
          subscription_type?: string | null
          transaction_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string
          realm_id: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          realm_id?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          realm_id?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          referred_user_id: string
          referrer_id: string
          reward_claimed: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_id: string
          reward_claimed?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_id?: string
          reward_claimed?: boolean | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          aadhaar_verified: boolean | null
          address_line1: string | null
          address_line2: string | null
          blockchain_hash: string | null
          business_category: string
          business_name: string
          city: string | null
          created_at: string
          gst_number: string | null
          id: string
          is_registered: boolean | null
          latitude: number | null
          longitude: number | null
          pin_code: string | null
          registered_at: string | null
          state: string | null
          store_description: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          aadhaar_verified?: boolean | null
          address_line1?: string | null
          address_line2?: string | null
          blockchain_hash?: string | null
          business_category: string
          business_name: string
          city?: string | null
          created_at?: string
          gst_number?: string | null
          id?: string
          is_registered?: boolean | null
          latitude?: number | null
          longitude?: number | null
          pin_code?: string | null
          registered_at?: string | null
          state?: string | null
          store_description?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          aadhaar_verified?: boolean | null
          address_line1?: string | null
          address_line2?: string | null
          blockchain_hash?: string | null
          business_category?: string
          business_name?: string
          city?: string | null
          created_at?: string
          gst_number?: string | null
          id?: string
          is_registered?: boolean | null
          latitude?: number | null
          longitude?: number | null
          pin_code?: string | null
          registered_at?: string | null
          state?: string | null
          store_description?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      business_type:
      | "cafe"
      | "salon"
      | "shop"
      | "restaurant"
      | "tuition"
      | "other"
      subscription_tier: "free" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      business_type: [
        "cafe",
        "salon",
        "shop",
        "restaurant",
        "tuition",
        "other",
      ],
      subscription_tier: ["free", "premium"],
    },
  },
} as const
