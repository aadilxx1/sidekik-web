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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      agent_configs: {
        Row: {
          created_at: string
          el_agent_id: string
          id: string
          kb_doc_id: string | null
          org_id: string
          procedure_ids: Json
          version: number
          workmap_id: string | null
        }
        Insert: {
          created_at?: string
          el_agent_id: string
          id?: string
          kb_doc_id?: string | null
          org_id: string
          procedure_ids?: Json
          version: number
          workmap_id?: string | null
        }
        Update: {
          created_at?: string
          el_agent_id?: string
          id?: string
          kb_doc_id?: string | null
          org_id?: string
          procedure_ids?: Json
          version?: number
          workmap_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_configs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_configs_workmap_id_fkey"
            columns: ["workmap_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_host_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          org_id: string
          session_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          org_id: string
          session_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          org_id?: string
          session_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_host_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_host_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          content_class: string
          created_at: string
          extracted_rule: string | null
          has_condition: boolean
          id: string
          org_id: string
          question_id: string
          quote: string
          quote_en: string | null
          session_id: string
          turn_ids: string[]
        }
        Insert: {
          content_class: string
          created_at?: string
          extracted_rule?: string | null
          has_condition?: boolean
          id?: string
          org_id: string
          question_id: string
          quote: string
          quote_en?: string | null
          session_id: string
          turn_ids: string[]
        }
        Update: {
          content_class?: string
          created_at?: string
          extracted_rule?: string | null
          has_condition?: boolean
          id?: string
          org_id?: string
          question_id?: string
          quote?: string
          quote_en?: string | null
          session_id?: string
          turn_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "answers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      clips: {
        Row: {
          created_at: string
          duration_s: number
          id: string
          org_id: string
          session_id: string
          step_id: string | null
          storage_path: string
          t_ms: number
        }
        Insert: {
          created_at?: string
          duration_s: number
          id?: string
          org_id: string
          session_id: string
          step_id?: string | null
          storage_path: string
          t_ms: number
        }
        Update: {
          created_at?: string
          duration_s?: number
          id?: string
          org_id?: string
          session_id?: string
          step_id?: string | null
          storage_path?: string
          t_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "clips_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clips_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clips_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "work_map_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          created_at: string
          granted_at: string
          id: string
          org_id: string
          scopes: string[]
          session_id: string
          text_version: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          granted_at?: string
          id?: string
          org_id: string
          scopes: string[]
          session_id: string
          text_version: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          granted_at?: string
          id?: string
          org_id?: string
          scopes?: string[]
          session_id?: string
          text_version?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_ledger: {
        Row: {
          cost_usd: number
          counterfactual_usd: number | null
          created_at: string
          id: string
          org_id: string
          service: string
          session_id: string | null
          unit: string
          units: number
          vendor: string
        }
        Insert: {
          cost_usd: number
          counterfactual_usd?: number | null
          created_at?: string
          id?: string
          org_id: string
          service: string
          session_id?: string | null
          unit: string
          units: number
          vendor: string
        }
        Update: {
          cost_usd?: number
          counterfactual_usd?: number | null
          created_at?: string
          id?: string
          org_id?: string
          service?: string
          session_id?: string | null
          unit?: string
          units?: number
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_ledger_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_ledger_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions_log: {
        Row: {
          answer: Json
          confidence: number | null
          cost_usd: number | null
          counterfactual_usd: number | null
          created_at: string
          decision: string
          escalated: boolean
          id: string
          input_tokens: number | null
          latency_ms: number
          model: string | null
          org_id: string
          provider: string
          session_id: string | null
        }
        Insert: {
          answer: Json
          confidence?: number | null
          cost_usd?: number | null
          counterfactual_usd?: number | null
          created_at?: string
          decision: string
          escalated?: boolean
          id?: string
          input_tokens?: number | null
          latency_ms: number
          model?: string | null
          org_id: string
          provider: string
          session_id?: string | null
        }
        Update: {
          answer?: Json
          confidence?: number | null
          cost_usd?: number | null
          counterfactual_usd?: number | null
          created_at?: string
          decision?: string
          escalated?: boolean
          id?: string
          input_tokens?: number | null
          latency_ms?: number
          model?: string | null
          org_id?: string
          provider?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_memory: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          open_item_ids: string[]
          org_id: string
          summary: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          open_item_ids?: string[]
          org_id: string
          summary?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          open_item_ids?: string[]
          org_id?: string
          summary?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_memory_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_memory_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_memory_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          created_at: string
          display_name: string
          id: string
          language: string
          onet_code: string | null
          org_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          language?: string
          onet_code?: string | null
          org_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          language?: string
          onet_code?: string | null
          org_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      gap_flags: {
        Row: {
          created_at: string
          guardrail_id: string | null
          id: string
          kind: string
          learner_ids: string[]
          org_id: string
          status: string
          step_id: string | null
          work_map_id: string
        }
        Insert: {
          created_at?: string
          guardrail_id?: string | null
          id?: string
          kind: string
          learner_ids?: string[]
          org_id: string
          status?: string
          step_id?: string | null
          work_map_id: string
        }
        Update: {
          created_at?: string
          guardrail_id?: string | null
          id?: string
          kind?: string
          learner_ids?: string[]
          org_id?: string
          status?: string
          step_id?: string | null
          work_map_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gap_flags_guardrail_id_fkey"
            columns: ["guardrail_id"]
            isOneToOne: false
            referencedRelation: "guardrails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gap_flags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gap_flags_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "work_map_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gap_flags_work_map_id_fkey"
            columns: ["work_map_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      guardrails: {
        Row: {
          consequence: Json
          created_at: string
          description: string
          id: string
          key: string
          kind: string
          org_id: string
          quote: string
          quote_en: string | null
          rule_jsonlogic: Json
          work_map_id: string
        }
        Insert: {
          consequence: Json
          created_at?: string
          description: string
          id?: string
          key: string
          kind: string
          org_id: string
          quote: string
          quote_en?: string | null
          rule_jsonlogic: Json
          work_map_id: string
        }
        Update: {
          consequence?: Json
          created_at?: string
          description?: string
          id?: string
          key?: string
          kind?: string
          org_id?: string
          quote?: string
          quote_en?: string | null
          rule_jsonlogic?: Json
          work_map_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardrails_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardrails_work_map_id_fkey"
            columns: ["work_map_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          created_at: string
          guardrail_id: string | null
          id: string
          learner_id: string
          org_id: string
          resolved: boolean
          session_id: string
          step_id: string | null
          style: string
          t_ms: number
          trigger: string
        }
        Insert: {
          created_at?: string
          guardrail_id?: string | null
          id?: string
          learner_id: string
          org_id: string
          resolved?: boolean
          session_id: string
          step_id?: string | null
          style: string
          t_ms: number
          trigger: string
        }
        Update: {
          created_at?: string
          guardrail_id?: string | null
          id?: string
          learner_id?: string
          org_id?: string
          resolved?: boolean
          session_id?: string
          step_id?: string | null
          style?: string
          t_ms?: number
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_guardrail_id_fkey"
            columns: ["guardrail_id"]
            isOneToOne: false
            referencedRelation: "guardrails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "work_map_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_chunks: {
        Row: {
          content: string
          created_at: string
          id: string
          kind: string
          org_id: string
          ref_id: string | null
          tsv: unknown
          work_map_id: string | null
          workflow_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          kind: string
          org_id: string
          ref_id?: string | null
          tsv?: unknown
          work_map_id?: string | null
          workflow_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          kind?: string
          org_id?: string
          ref_id?: string | null
          tsv?: unknown
          work_map_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_chunks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_chunks_work_map_id_fkey"
            columns: ["work_map_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_chunks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      keyframes: {
        Row: {
          created_at: string
          id: string
          org_id: string
          phash: string
          redacted: boolean
          session_id: string
          storage_path: string
          t_ms: number
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          phash: string
          redacted?: boolean
          session_id: string
          storage_path: string
          t_ms: number
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          phash?: string
          redacted?: boolean
          session_id?: string
          storage_path?: string
          t_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "keyframes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyframes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_attempts: {
        Row: {
          actual_action: Json | null
          case_ref: string | null
          created_at: string
          id: string
          learner_id: string
          org_id: string
          outcome: string | null
          predicted: string | null
          prediction_grade: string | null
          session_id: string
          step_id: string
          work_map_id: string
        }
        Insert: {
          actual_action?: Json | null
          case_ref?: string | null
          created_at?: string
          id?: string
          learner_id: string
          org_id: string
          outcome?: string | null
          predicted?: string | null
          prediction_grade?: string | null
          session_id: string
          step_id: string
          work_map_id: string
        }
        Update: {
          actual_action?: Json | null
          case_ref?: string | null
          created_at?: string
          id?: string
          learner_id?: string
          org_id?: string
          outcome?: string | null
          predicted?: string | null
          prediction_grade?: string | null
          session_id?: string
          step_id?: string
          work_map_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_attempts_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_attempts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_attempts_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "work_map_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_attempts_work_map_id_fkey"
            columns: ["work_map_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      learners: {
        Row: {
          created_at: string
          display_name: string
          id: string
          language: string
          org_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          language?: string
          org_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          language?: string
          org_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learners_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery: {
        Row: {
          created_at: string
          id: string
          learner_id: string
          org_id: string
          session_id: string
          summary: Json
          work_map_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          learner_id: string
          org_id: string
          session_id: string
          summary: Json
          work_map_id: string
        }
        Update: {
          created_at?: string
          id?: string
          learner_id?: string
          org_id?: string
          session_id?: string
          summary?: Json
          work_map_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_work_map_id_fkey"
            columns: ["work_map_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_bots: {
        Row: {
          bot_id: string
          created_at: string
          error: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          org_id: string
          platform: string | null
          session_id: string
          status: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          error?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          org_id: string
          platform?: string | null
          session_id: string
          status: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          error?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          org_id?: string
          platform?: string | null
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_bots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_bots_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      off_record_spans: {
        Row: {
          created_at: string
          end_t_ms: number | null
          id: string
          org_id: string
          session_id: string
          source: string
          start_t_ms: number
        }
        Insert: {
          created_at?: string
          end_t_ms?: number | null
          id?: string
          org_id: string
          session_id: string
          source: string
          start_t_ms: number
        }
        Update: {
          created_at?: string
          end_t_ms?: number | null
          id?: string
          org_id?: string
          session_id?: string
          source?: string
          start_t_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "off_record_spans_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "off_record_spans_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      open_items: {
        Row: {
          anchor_t_ms: number | null
          created_at: string
          id: string
          importance: number
          org_id: string
          origin: string
          session_id: string | null
          status: string
          text: string
          work_map_id: string | null
          workflow_id: string
        }
        Insert: {
          anchor_t_ms?: number | null
          created_at?: string
          id?: string
          importance?: number
          org_id: string
          origin: string
          session_id?: string | null
          status: string
          text: string
          work_map_id?: string | null
          workflow_id: string
        }
        Update: {
          anchor_t_ms?: number | null
          created_at?: string
          id?: string
          importance?: number
          org_id?: string
          origin?: string
          session_id?: string | null
          status?: string
          text?: string
          work_map_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "open_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_items_work_map_id_fkey"
            columns: ["work_map_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_items_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
          settings: Json
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          settings?: Json
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          settings?: Json
        }
        Relationships: []
      }
      questions: {
        Row: {
          anchor_event_ids: string[]
          asked_t_ms: number | null
          created_at: string
          created_t_ms: number
          id: string
          jev_scores: Json | null
          org_id: string
          phase: string
          qtype: string
          session_id: string
          status: string
          text: string
        }
        Insert: {
          anchor_event_ids?: string[]
          asked_t_ms?: number | null
          created_at?: string
          created_t_ms: number
          id?: string
          jev_scores?: Json | null
          org_id: string
          phase: string
          qtype: string
          session_id: string
          status: string
          text: string
        }
        Update: {
          anchor_event_ids?: string[]
          asked_t_ms?: number | null
          created_at?: string
          created_t_ms?: number
          id?: string
          jev_scores?: Json | null
          org_id?: string
          phase?: string
          qtype?: string
          session_id?: string
          status?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      replay_events: {
        Row: {
          created_at: string
          envelope: Json
          id: string
          org_id: string
          session_id: string
          stream: string
          t_ms: number
        }
        Insert: {
          created_at?: string
          envelope: Json
          id?: string
          org_id: string
          session_id: string
          stream: string
          t_ms: number
        }
        Update: {
          created_at?: string
          envelope?: Json
          id?: string
          org_id?: string
          session_id?: string
          stream?: string
          t_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "replay_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replay_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      screen_events: {
        Row: {
          after_val: string | null
          bbox: Json | null
          before_val: string | null
          confidence: number | null
          created_at: string
          entity_id: string | null
          entity_kind: string | null
          event_class: string | null
          event_id: string
          field: string | null
          id: string
          keyframe_id: string | null
          org_id: string
          session_id: string
          source: string
          state: Json | null
          t_ms: number
          type: string
        }
        Insert: {
          after_val?: string | null
          bbox?: Json | null
          before_val?: string | null
          confidence?: number | null
          created_at?: string
          entity_id?: string | null
          entity_kind?: string | null
          event_class?: string | null
          event_id: string
          field?: string | null
          id?: string
          keyframe_id?: string | null
          org_id: string
          session_id: string
          source: string
          state?: Json | null
          t_ms: number
          type: string
        }
        Update: {
          after_val?: string | null
          bbox?: Json | null
          before_val?: string | null
          confidence?: number | null
          created_at?: string
          entity_id?: string | null
          entity_kind?: string | null
          event_class?: string | null
          event_id?: string
          field?: string | null
          id?: string
          keyframe_id?: string | null
          org_id?: string
          session_id?: string
          source?: string
          state?: Json | null
          t_ms?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "screen_events_keyframe_id_fkey"
            columns: ["keyframe_id"]
            isOneToOne: false
            referencedRelation: "keyframes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screen_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screen_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          consent_at: string | null
          created_at: string
          el_agent_id: string | null
          el_conversation_id: string | null
          ended_at: string | null
          expert_id: string | null
          id: string
          kind: string
          language: string
          learner_id: string | null
          mode: string
          off_record: boolean
          org_id: string
          phase: string
          replay_of: string | null
          started_at: string
          workflow_id: string
          workmap_id: string | null
        }
        Insert: {
          consent_at?: string | null
          created_at?: string
          el_agent_id?: string | null
          el_conversation_id?: string | null
          ended_at?: string | null
          expert_id?: string | null
          id?: string
          kind: string
          language?: string
          learner_id?: string | null
          mode: string
          off_record?: boolean
          org_id: string
          phase: string
          replay_of?: string | null
          started_at?: string
          workflow_id: string
          workmap_id?: string | null
        }
        Update: {
          consent_at?: string | null
          created_at?: string
          el_agent_id?: string | null
          el_conversation_id?: string | null
          ended_at?: string | null
          expert_id?: string | null
          id?: string
          kind?: string
          language?: string
          learner_id?: string | null
          mode?: string
          off_record?: boolean
          org_id?: string
          phase?: string
          replay_of?: string | null
          started_at?: string
          workflow_id?: string
          workmap_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_replay_of_fkey"
            columns: ["replay_of"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_workmap_id_fkey"
            columns: ["workmap_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      step_evidence: {
        Row: {
          clip_id: string | null
          created_at: string
          guardrail_id: string | null
          id: string
          keyframe_id: string | null
          org_id: string
          quote: string | null
          screen_event_id: string | null
          source_label: string | null
          step_id: string | null
          t_ms: number
          transcript_turn_id: string
          work_map_id: string
        }
        Insert: {
          clip_id?: string | null
          created_at?: string
          guardrail_id?: string | null
          id?: string
          keyframe_id?: string | null
          org_id: string
          quote?: string | null
          screen_event_id?: string | null
          source_label?: string | null
          step_id?: string | null
          t_ms: number
          transcript_turn_id: string
          work_map_id: string
        }
        Update: {
          clip_id?: string | null
          created_at?: string
          guardrail_id?: string | null
          id?: string
          keyframe_id?: string | null
          org_id?: string
          quote?: string | null
          screen_event_id?: string | null
          source_label?: string | null
          step_id?: string | null
          t_ms?: number
          transcript_turn_id?: string
          work_map_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_evidence_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "clips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_evidence_guardrail_id_fkey"
            columns: ["guardrail_id"]
            isOneToOne: false
            referencedRelation: "guardrails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_evidence_keyframe_id_fkey"
            columns: ["keyframe_id"]
            isOneToOne: false
            referencedRelation: "keyframes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_evidence_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_evidence_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "work_map_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_evidence_work_map_id_fkey"
            columns: ["work_map_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      transcript_turns: {
        Row: {
          created_at: string
          id: string
          lang: string | null
          off_record: boolean
          org_id: string
          role: string
          session_id: string
          source: string
          t_ms: number
          text_redacted: string
          turn_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lang?: string | null
          off_record?: boolean
          org_id: string
          role: string
          session_id: string
          source: string
          t_ms: number
          text_redacted: string
          turn_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lang?: string | null
          off_record?: boolean
          org_id?: string
          role?: string
          session_id?: string
          source?: string
          t_ms?: number
          text_redacted?: string
          turn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcript_turns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcript_turns_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      work_map_steps: {
        Row: {
          created_at: string
          decision: string
          el_procedure_id: string | null
          id: string
          is_judgment_call: boolean
          key: string
          ordinal: number
          org_id: string
          reason_quote: string | null
          reason_quote_en: string | null
          reason_turn_id: string | null
          screen_moment: Json
          screen_signature: Json
          source_label: string | null
          title: string
          work_map_id: string
        }
        Insert: {
          created_at?: string
          decision: string
          el_procedure_id?: string | null
          id?: string
          is_judgment_call?: boolean
          key: string
          ordinal: number
          org_id: string
          reason_quote?: string | null
          reason_quote_en?: string | null
          reason_turn_id?: string | null
          screen_moment: Json
          screen_signature: Json
          source_label?: string | null
          title: string
          work_map_id: string
        }
        Update: {
          created_at?: string
          decision?: string
          el_procedure_id?: string | null
          id?: string
          is_judgment_call?: boolean
          key?: string
          ordinal?: number
          org_id?: string
          reason_quote?: string | null
          reason_quote_en?: string | null
          reason_turn_id?: string | null
          screen_moment?: Json
          screen_signature?: Json
          source_label?: string | null
          title?: string
          work_map_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_map_steps_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_map_steps_work_map_id_fkey"
            columns: ["work_map_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      work_maps: {
        Row: {
          confirmed_turn_id: string | null
          created_at: string
          expert_id: string
          id: string
          json: Json
          language: string
          org_id: string
          published_at: string | null
          session_id: string | null
          status: string
          version: number
          workflow_id: string
        }
        Insert: {
          confirmed_turn_id?: string | null
          created_at?: string
          expert_id: string
          id?: string
          json: Json
          language: string
          org_id: string
          published_at?: string | null
          session_id?: string | null
          status: string
          version: number
          workflow_id: string
        }
        Update: {
          confirmed_turn_id?: string | null
          created_at?: string
          expert_id?: string
          id?: string
          json?: Json
          language?: string
          org_id?: string
          published_at?: string | null
          session_id?: string | null
          status?: string
          version?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_maps_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_maps_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_maps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_maps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          current_workmap_id: string | null
          description: string | null
          id: string
          name: string
          onet_code: string | null
          org_id: string
        }
        Insert: {
          created_at?: string
          current_workmap_id?: string | null
          description?: string | null
          id?: string
          name: string
          onet_code?: string | null
          org_id: string
        }
        Update: {
          created_at?: string
          current_workmap_id?: string | null
          description?: string | null
          id?: string
          name?: string
          onet_code?: string | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_current_workmap_id_fkey"
            columns: ["current_workmap_id"]
            isOneToOne: false
            referencedRelation: "work_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      grant_demo_role: {
        Args: { p_email: string; p_role?: string }
        Returns: undefined
      }
      has_role: { Args: { org: string; roles: string[] }; Returns: boolean }
      is_member: { Args: { org: string }; Returns: boolean }
      search_kb: {
        Args: {
          p_limit?: number
          p_org: string
          p_query: string
          p_workflow: string
        }
        Returns: {
          content: string
          id: string
          kind: string
          ref_id: string
          score: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
